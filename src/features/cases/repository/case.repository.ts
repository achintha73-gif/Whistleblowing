import { prisma } from '@/lib/db';
import type { CasePriority, CaseStatus } from '../types';

/**
 * Case Repository - DB access ONLY.
 * No business logic. No auth checks.
 */

// -------------------------------------------------------------
// Relations to include by default
// -------------------------------------------------------------

const INVESTIGATOR_SELECT = {
  user_id: true,
  name: true,
  email: true,
} as const;

const COMPLAINT_SUMMARY = {
  complaint_id: true,
  title: true,
  description: true,
  category: true,
  isAnonymous: true,
} as const;

// -------------------------------------------------------------
// Create
// -------------------------------------------------------------

/**
 * Create a case directly from a complaint.
 * Business rules (like "complaint must not already have a case")
 * are enforced in the service layer.
 */
export async function createCase(data: {
  complaint_id: number;
  priority: CasePriority;
}) {
  return prisma.case.create({
    data: {
      complaint_id: data.complaint_id,
      priority: data.priority,
      status: 'OPEN',
    },
    include: {
      complaint: { select: COMPLAINT_SUMMARY },
      assignedInvestigator: { select: INVESTIGATOR_SELECT },
    },
  });
}

// -------------------------------------------------------------
// Read
// -------------------------------------------------------------

export async function findCaseById(caseId: number) {
  return prisma.case.findUnique({
    where: { case_id: caseId },
    include: {
      complaint: { select: COMPLAINT_SUMMARY },
      assignedInvestigator: { select: INVESTIGATOR_SELECT },
    },
  });
}

export async function findCaseByComplaintId(complaintId: number) {
  return prisma.case.findUnique({
    where: { complaint_id: complaintId },
  });
}

export async function listAllCases(filter?: {
  status?: CaseStatus;
  investigatorId?: number;
}) {
  const where: Record<string, unknown> = {};
  if (filter?.status) where.status = filter.status;
  if (filter?.investigatorId) where.assigned_investigator_id = filter.investigatorId;

  return prisma.case.findMany({
    where,
    orderBy: { created_at: 'desc' },
    include: {
      complaint: { select: COMPLAINT_SUMMARY },
      assignedInvestigator: { select: INVESTIGATOR_SELECT },
    },
  });
}

export async function listCasesForInvestigator(investigatorId: number) {
  return prisma.case.findMany({
    where: { assigned_investigator_id: investigatorId },
    orderBy: { created_at: 'desc' },
    include: {
      complaint: { select: COMPLAINT_SUMMARY },
      assignedInvestigator: { select: INVESTIGATOR_SELECT },
    },
  });
}

// -------------------------------------------------------------
// Update
// -------------------------------------------------------------

export async function assignInvestigator(
  caseId: number,
  investigatorId: number
) {
  return prisma.case.update({
    where: { case_id: caseId },
    data: { assigned_investigator_id: investigatorId },
  });
}

/**
 * Update case status.
 * Sets closed_at timestamp when moving to CLOSED or ARCHIVED.
 */
export async function updateCaseStatus(caseId: number, status: CaseStatus) {
  const isClosed = status === 'CLOSED' || status === 'ARCHIVED';

  return prisma.case.update({
    where: { case_id: caseId },
    data: {
      status,
      closed_at: isClosed ? new Date() : null,
    },
  });
}

// -------------------------------------------------------------
// Status History
// -------------------------------------------------------------

export async function addStatusHistory(data: {
  case_id: number;
  status: CaseStatus;
  changed_by: number;
}) {
  return prisma.caseStatusHistory.create({
    data: {
      case_id: data.case_id,
      status: data.status,
      changed_by: data.changed_by,
    },
  });
}

export async function listStatusHistoryForCase(caseId: number) {
  return prisma.caseStatusHistory.findMany({
    where: { case_id: caseId },
    orderBy: { changed_at: 'asc' },
    include: {
      changedBy: { select: { user_id: true, name: true } },
    },
  });
}

// -------------------------------------------------------------
// Stats
// -------------------------------------------------------------

export async function countCasesByStatus() {
  const rows = await prisma.case.groupBy({
    by: ['status'],
    _count: { _all: true },
  });

  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.status] = row._count._all;
  }
  return counts;
}

export async function countAllCases(): Promise<number> {
  return prisma.case.count();
}

export async function countCasesForInvestigator(
  investigatorId: number
): Promise<number> {
  return prisma.case.count({
    where: { assigned_investigator_id: investigatorId },
  });
}