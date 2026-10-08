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
import {
  notifyUser,
  getManagerForCase,
} from '@/features/notifications/services/notification.service';

// Prisma -> DTO mappers

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

// Create Case from Complaint (MANAGER only, atomic)

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

  if (complaint.user_id) {
    await notifyUser(
      complaint.user_id,
      `Your complaint "${complaint.title}" has been converted to Case #${created.case_id}.`
    );
  }

  return { success: true, caseDetail: toCaseDetail(created as PrismaCaseRow) };
}

// List Cases (role-aware)

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

  throw new Error('Forbidden');
}

// Get Single Case (access-controlled)

export async function getCaseForUser(
  user: SafeUser,
  caseId: number
): Promise<CaseDetail | null> {
  const row = await caseRepo.findCaseById(caseId);
  if (!row) return null;

  if (user.roleName === 'MANAGER' || user.roleName === 'ADMIN') {
    return toCaseDetail(row as PrismaCaseRow);
  }

  if (user.roleName === 'INVESTIGATOR') {
    if (row.assigned_investigator_id !== user.userId) return null;
    return toCaseDetail(row as PrismaCaseRow);
  }

  return null;
}

// Assign Investigator (MANAGER only)

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

  // Assign investigator
  await caseRepo.assignInvestigator(caseId, investigatorId);

  // Auto-advance status from OPEN to INVESTIGATING
  const currentStatus = caseRow.status as CaseStatus;
  const shouldAdvance = currentStatus === 'OPEN';

  if (shouldAdvance) {
    await caseRepo.updateCaseStatus(caseId, 'INVESTIGATING');
    await caseRepo.addStatusHistory({
      case_id: caseId,
      status: 'INVESTIGATING',
      changed_by: user.userId,
    });
  }

  // Notify the investigator
  await notifyUser(
    investigatorId,
    `You have been assigned to Case #${caseId}: ${caseRow.complaint.title}`
  );

  // Notify manager of the case (if any) that assignment happened
  const managerId = await getManagerForCase(caseId);
  if (managerId && managerId !== user.userId) {
    await notifyUser(
      managerId,
      `Case #${caseId} has been assigned to ${investigator.name}${
        shouldAdvance ? ' and moved to Investigating' : ''
      }`
    );
  }

  return { success: true };
}
// -------------------------------------------------------------
// Multi-investigator assign (used by the checkbox UI)
// -------------------------------------------------------------

export async function setCaseInvestigatorsForUser(
  user: SafeUser,
  caseId: number,
  investigatorIds: number[]
): Promise<
  | { success: true; added: number[]; removed: number[] }
  | { success: false; error: string }
> {
  if (user.roleName !== 'MANAGER') {
    return { success: false, error: 'Only managers can assign investigators' };
  }

  const caseRow = await caseRepo.findCaseById(caseId);
  if (!caseRow) return { success: false, error: 'Case not found' };

  // Validate all investigator IDs
  const uniqueIds = Array.from(new Set(investigatorIds));

  if (uniqueIds.length > 0) {
    const investigators = await prisma.user.findMany({
      where: { user_id: { in: uniqueIds } },
      include: { role: true },
    });

    if (investigators.length !== uniqueIds.length) {
      return { success: false, error: 'One or more investigators not found' };
    }

    for (const inv of investigators) {
      if (inv.role.role_name !== 'INVESTIGATOR') {
        return {
          success: false,
          error: `${inv.name} is not an investigator`,
        };
      }
      if (inv.status !== 'ACTIVE') {
        return {
          success: false,
          error: `${inv.name} is not active`,
        };
      }
    }
  }

  // Snapshot before (with names)
  const before = await caseRepo.listCaseInvestigators(caseId);
  const beforeMap = new Map(before.map((i) => [i.userId, i.name]));
  const beforeIds = before.map((i) => i.userId);

  // Apply changes
  await caseRepo.setCaseInvestigators(caseId, uniqueIds);

  // Snapshot after (with names)
  const after = await caseRepo.listCaseInvestigators(caseId);
  const afterMap = new Map(after.map((i) => [i.userId, i.name]));
  const afterIds = after.map((i) => i.userId);

  const added = afterIds.filter((id) => !beforeIds.includes(id));
  const removed = beforeIds.filter((id) => !afterIds.includes(id));

  const addedNames = added.map((id) => afterMap.get(id) ?? `#${id}`);
  const removedNames = removed.map((id) => beforeMap.get(id) ?? `#${id}`);

  // Auto-advance OPEN -> INVESTIGATING when first investigator assigned
  const currentStatus = caseRow.status as CaseStatus;
  const shouldAdvance = currentStatus === 'OPEN' && after.length > 0;

  if (shouldAdvance) {
    await caseRepo.updateCaseStatus(caseId, 'INVESTIGATING');
    await caseRepo.addStatusHistory({
      case_id: caseId,
      status: 'INVESTIGATING',
      changed_by: user.userId,
      note:
        addedNames.length > 0
          ? `Investigator assigned: ${addedNames.join(', ')}`
          : null,
    });
  } else if (added.length > 0 || removed.length > 0) {
    // Log investigator change under the CURRENT status (no status change)
    await caseRepo.addStatusHistory({
      case_id: caseId,
      status: currentStatus,
      changed_by: user.userId,
      note: [
        addedNames.length > 0
          ? `Investigator assigned: ${addedNames.join(', ')}`
          : null,
        removedNames.length > 0
          ? `Investigator removed: ${removedNames.join(', ')}`
          : null,
      ]
        .filter(Boolean)
        .join(' · '),
    });
  }

  // Notify newly added investigators
  for (const id of added) {
    await notifyUser(
      id,
      `You have been assigned to Case #${caseId}: ${caseRow.complaint.title}`
    );
  }

  // Notify removed investigators
  for (const id of removed) {
    await notifyUser(
      id,
      `You have been removed from Case #${caseId}: ${caseRow.complaint.title}`
    );
  }

  // Notify the department manager (if any)
  const managerId = await getManagerForCase(caseId);
  if (managerId && managerId !== user.userId && (added.length || removed.length)) {
    const parts: string[] = [];
    if (added.length) parts.push(`${added.length} added`);
    if (removed.length) parts.push(`${removed.length} removed`);
    await notifyUser(
      managerId,
      `Case #${caseId} investigators updated (${parts.join(', ')})`
    );
  }

  return { success: true, added, removed };
}

// Update Status (MANAGER or INVESTIGATOR)

export async function updateCaseStatusForUser(
  user: SafeUser,
  caseId: number,
  newStatus: CaseStatus
): Promise<{ success: true } | { success: false; error: string }> {
  const caseRow = await caseRepo.findCaseById(caseId);
  if (!caseRow) return { success: false, error: 'Case not found' };

  if (user.roleName === 'MANAGER') {
    // Manager can update any case
  } else if (user.roleName === 'INVESTIGATOR') {
    if (caseRow.assigned_investigator_id !== user.userId) {
      return { success: false, error: 'You are not assigned to this case' };
    }
  } else {
    return { success: false, error: 'Forbidden' };
  }

  if (caseRow.status === newStatus) {
    return { success: false, error: 'Case is already in this status' };
  }

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

  // Notify the complainant if not anonymous
  const fullComplaint = await prisma.complaint.findUnique({
    where: { complaint_id: caseRow.complaint_id },
    select: { user_id: true, isAnonymous: true },
  });

  if (fullComplaint?.user_id && !fullComplaint.isAnonymous) {
    await notifyUser(
      fullComplaint.user_id,
      `The status of your case (Case #${caseId}) has been updated to "${newStatus}".`
    );
  }

  // Notify the manager ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â but only if an INVESTIGATOR made the change
  if (user.roleName === 'INVESTIGATOR') {
    const managerId = await getManagerForCase(caseId);
    await notifyUser(
      managerId,
      `Investigator ${user.name} updated Case #${caseId} to "${newStatus}".`
    );
  }

  return { success: true };
}

// List Available Investigators

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

// Stats

export async function getCaseStats() {
  const byStatus = await caseRepo.countCasesByStatus();
  const total = await caseRepo.countAllCases();
  return { total, byStatus };
}

// Status History

export async function getCaseHistory(caseId: number) {
  return caseRepo.listStatusHistoryForCase(caseId);
}

// -------------------------------------------------------------
// Manager Dashboard Stats
// -------------------------------------------------------------

export async function getManagerDashboardStats() {
  const [complaintStats, caseStats, unassignedCases, recentPending] =
    await Promise.all([
      (async () => {
        const rows = await prisma.complaint.groupBy({
          by: ['status'],
          _count: { _all: true },
        });
        const byStatus: Record<string, number> = {};
        rows.forEach((r) => {
          byStatus[r.status] = r._count._all;
        });
        const total = rows.reduce((sum, r) => sum + r._count._all, 0);
        return { total, byStatus };
      })(),
      (async () => {
        const rows = await prisma.case.groupBy({
          by: ['status'],
          _count: { _all: true },
        });
        const byStatus: Record<string, number> = {};
        rows.forEach((r) => {
          byStatus[r.status] = r._count._all;
        });
        const total = rows.reduce((sum, r) => sum + r._count._all, 0);
        return { total, byStatus };
      })(),
      prisma.case.count({ where: { assigned_investigator_id: null } }),
      prisma.complaint.findMany({
        where: { status: 'PENDING' },
        take: 5,
        orderBy: { created_at: 'desc' },
        select: {
          complaint_id: true,
          title: true,
          category: true,
          isAnonymous: true,
          created_at: true,
        },
      }),
    ]);

  return {
    totalComplaints: complaintStats.total,
    pendingComplaints: complaintStats.byStatus.PENDING ?? 0,
    totalCases: caseStats.total,
    openCases: caseStats.byStatus.OPEN ?? 0,
    investigatingCases: caseStats.byStatus.INVESTIGATING ?? 0,
    unassignedCases,
    recentPending,
  };
}

// -------------------------------------------------------------
// Investigator Dashboard Stats
// -------------------------------------------------------------

export async function getInvestigatorDashboardStats(userId: number) {
  const [statusCounts, recentCases, evidenceCount, unreadNotifications] =
    await Promise.all([
      // Case counts by status for this investigator
      prisma.case.groupBy({
        by: ['status'],
        where: { assigned_investigator_id: userId },
        _count: { _all: true },
      }),
      // Recent assigned cases
      prisma.case.findMany({
        where: { assigned_investigator_id: userId },
        take: 5,
        orderBy: { updated_at: 'desc' },
        include: {
          complaint: {
            select: {
              complaint_id: true,
              title: true,
              category: true,
              isAnonymous: true,
            },
          },
        },
      }),
      // Total evidence across investigator's cases
      prisma.evidence.count({
        where: {
          case: { assigned_investigator_id: userId },
        },
      }),
      // Unread notifications
      prisma.notification.count({
        where: { user_id: userId, is_read: false },
      }),
    ]);

  const byStatus: Record<string, number> = {};
  statusCounts.forEach((r) => {
    byStatus[r.status] = r._count._all;
  });

  const total = statusCounts.reduce((sum, r) => sum + r._count._all, 0);

  return {
    totalCases: total,
    openCases: byStatus.OPEN ?? 0,
    investigatingCases: byStatus.INVESTIGATING ?? 0,
    pendingReviewCases: byStatus.PENDING_REVIEW ?? 0,
    closedCases: (byStatus.CLOSED ?? 0) + (byStatus.ARCHIVED ?? 0),
    evidenceCount,
    unreadNotifications,
    recentCases: recentCases.map((c) => ({
      caseId: c.case_id,
      complaintTitle: c.complaint.title,
      category: c.complaint.category,
      isAnonymous: c.complaint.isAnonymous,
      status: c.status,
      priority: c.priority,
      updatedAt: c.updated_at,
    })),
  };
}