import { prisma } from '@/lib/db';
import type { SafeUser } from '@/features/auth/types';
import type {
  CaseDetail,
  CasePriority,
  CaseStatus,
  CaseSummary,
} from '../types';
import * as caseRepo from '../repository/case.repository';
import * as complaintRepo from '@/features/complaints/repository/complaint.repository';

// -------------------------------------------------------------
// Prisma -> DTO mappers
// -------------------------------------------------------------

type PrismaCaseRow = {
  case_id: number;
  complaint_id: number;
  status: string;
  priority: string;
  assigned_investigator_id: number | null;
  created_at: Date;
  updated_at: Date;
  closed_at: Date | null;
  complaint: {
    complaint_id: number;
    title: string;
    description: string;
    category: string | null;
    isAnonymous: boolean;
  };
  assignedInvestigator: {
    user_id: number;
    name: string;
    email: string;
  } | null;
};

export function toCaseSummary(row: PrismaCaseRow): CaseSummary {
  return {
    caseId: row.case_id,
    complaintId: row.complaint_id,
    complaintTitle: row.complaint.title,
    status: row.status as CaseStatus,
    priority: row.priority as CasePriority,
    assignedInvestigator: row.assignedInvestigator
      ? {
          userId: row.assignedInvestigator.user_id,
          name: row.assignedInvestigator.name,
        }
      : null,
    createdAt: row.created_at,
  };
}

export function toCaseDetail(row: PrismaCaseRow): CaseDetail {
  return {
    caseId: row.case_id,
    complaintId: row.complaint_id,
    complaintTitle: row.complaint.title,
    complaintDescription: row.complaint.description,
    complaintCategory: row.complaint.category,
    complaintIsAnonymous: row.complaint.isAnonymous,
    status: row.status as CaseStatus,
    priority: row.priority as CasePriority,
    assignedInvestigator: row.assignedInvestigator
      ? {
          userId: row.assignedInvestigator.user_id,
          name: row.assignedInvestigator.name,
          email: row.assignedInvestigator.email,
        }
      : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    closedAt: row.closed_at,
  };
}

// -------------------------------------------------------------
// Create Case from Complaint (MANAGER only, atomic)
// -------------------------------------------------------------

export interface CreateCaseResult {
  success: true;
  caseDetail: CaseDetail;
}

export interface CreateCaseError {
  success: false;
  error: string;
}

export async function createCaseFromComplaint(
  user: SafeUser,
  complaintId: number,
  priority: CasePriority = 'MEDIUM'
): Promise<CreateCaseResult | CreateCaseError> {
  if (user.roleName !== 'MANAGER') {
    return { success: false, error: 'Only managers can create cases' };
  }

  const complaint = await complaintRepo.findComplaintById(complaintId);
  if (!complaint) {
    return { success: false, error: 'Complaint not found' };
  }

  if (complaint.status === 'CONVERTED_TO_CASE') {
    return { success: false, error: 'This complaint already has a case' };
  }

  if (complaint.status === 'REJECTED') {
    return { success: false, error: 'Rejected complaints cannot be converted' };
  }

  // Atomic: create case + update complaint status + log initial history
  const created = await prisma.$transaction(async (tx) => {
    const newCase = await tx.case.create({
      data: {
        complaint_id: complaintId,
        priority,
        status: 'OPEN',
      },
      include: {
        complaint: {
          select: {
            complaint_id: true,
            title: true,
            description: true,
            category: true,
            isAnonymous: true,
          },
        },
        assignedInvestigator: {
          select: { user_id: true, name: true, email: true },
        },
      },
    });

    await tx.complaint.update({
      where: { complaint_id: complaintId },
      data: { status: 'CONVERTED_TO_CASE' },
    });

    await tx.caseStatusHistory.create({
      data: {
        case_id: newCase.case_id,
        status: 'OPEN',
        changed_by: user.userId,
      },
    });

    return newCase;
  });

  return { success: true, caseDetail: toCaseDetail(created as PrismaCaseRow) };
}

// -------------------------------------------------------------
// List Cases (role-aware)
// -------------------------------------------------------------

export async function listCasesForUser(
  user: SafeUser,
  filter?: { status?: CaseStatus }
): Promise<CaseSummary[]> {
  if (user.roleName === 'INVESTIGATOR') {
    const rows = await caseRepo.listCasesForInvestigator(user.userId);
    return rows.map((r) => toCaseSummary(r as PrismaCaseRow));
  }

  if (user.roleName === 'MANAGER' || user.roleName === 'ADMIN') {
    const rows = await caseRepo.listAllCases(filter);
    return rows.map((r) => toCaseSummary(r as PrismaCaseRow));
  }

  // USER role - no access to cases
  throw new Error('Forbidden');
}

// -------------------------------------------------------------
// Get Single Case (access-controlled)
// -------------------------------------------------------------

export async function getCaseForUser(
  user: SafeUser,
  caseId: number
): Promise<CaseDetail | null> {
  const row = await caseRepo.findCaseById(caseId);
  if (!row) return null;

  // Manager and Admin see any case
  if (user.roleName === 'MANAGER' || user.roleName === 'ADMIN') {
    return toCaseDetail(row as PrismaCaseRow);
  }

  // Investigator sees only their assigned cases
  if (user.roleName === 'INVESTIGATOR') {
    if (row.assigned_investigator_id !== user.userId) return null;
    return toCaseDetail(row as PrismaCaseRow);
  }

  // USER role cannot access cases
  return null;
}

// -------------------------------------------------------------
// Assign Investigator (MANAGER only, atomic)
// -------------------------------------------------------------

export async function assignInvestigatorToCase(
  user: SafeUser,
  caseId: number,
  investigatorId: number
): Promise<{ success: true } | { success: false; error: string }> {
  if (user.roleName !== 'MANAGER') {
    return { success: false, error: 'Only managers can assign investigators' };
  }

  const caseRow = await caseRepo.findCaseById(caseId);
  if (!caseRow) return { success: false, error: 'Case not found' };

  // Verify target user exists and has INVESTIGATOR role
  const investigator = await prisma.user.findUnique({
    where: { user_id: investigatorId },
    include: { role: true },
  });

  if (!investigator || investigator.role.role_name !== 'INVESTIGATOR') {
    return { success: false, error: 'Invalid investigator' };
  }

  if (investigator.status !== 'ACTIVE') {
    return { success: false, error: 'Investigator is not active' };
  }

  await caseRepo.assignInvestigator(caseId, investigatorId);

  return { success: true };
}

// -------------------------------------------------------------
// Update Status (MANAGER or INVESTIGATOR, atomic)
// -------------------------------------------------------------

export async function updateCaseStatusForUser(
  user: SafeUser,
  caseId: number,
  newStatus: CaseStatus
): Promise<{ success: true } | { success: false; error: string }> {
  const caseRow = await caseRepo.findCaseById(caseId);
  if (!caseRow) return { success: false, error: 'Case not found' };

  // Permission checks
  if (user.roleName === 'MANAGER') {
    // Manager can update any case
  } else if (user.roleName === 'INVESTIGATOR') {
    // Investigator can only update their assigned cases
    if (caseRow.assigned_investigator_id !== user.userId) {
      return { success: false, error: 'You are not assigned to this case' };
    }
  } else {
    return { success: false, error: 'Forbidden' };
  }

  if (caseRow.status === newStatus) {
    return { success: false, error: 'Case is already in this status' };
  }

  // Atomic: update status + log history
  await prisma.$transaction(async (tx) => {
    const isClosed = newStatus === 'CLOSED' || newStatus === 'ARCHIVED';
    await tx.case.update({
      where: { case_id: caseId },
      data: {
        status: newStatus,
        closed_at: isClosed ? new Date() : null,
      },
    });

    await tx.caseStatusHistory.create({
      data: {
        case_id: caseId,
        status: newStatus,
        changed_by: user.userId,
      },
    });
  });

  return { success: true };
}

// -------------------------------------------------------------
// List Available Investigators (for manager dropdown)
// -------------------------------------------------------------

export async function listAvailableInvestigators() {
  return prisma.user.findMany({
    where: {
      status: 'ACTIVE',
      role: { role_name: 'INVESTIGATOR' },
    },
    select: {
      user_id: true,
      name: true,
      email: true,
    },
    orderBy: { name: 'asc' },
  });
}

// -------------------------------------------------------------
// Stats
// -------------------------------------------------------------

export async function getCaseStats() {
  const byStatus = await caseRepo.countCasesByStatus();
  const total = await caseRepo.countAllCases();
  return { total, byStatus };
}

// -------------------------------------------------------------
// Status History
// -------------------------------------------------------------

export async function getCaseHistory(caseId: number) {
  return caseRepo.listStatusHistoryForCase(caseId);
}