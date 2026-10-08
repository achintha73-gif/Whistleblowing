import { prisma } from '@/lib/db';
import type { CasePriority, CaseStatus } from '../types';

/**
 * Case Repository - DB access ONLY.
 */

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
    where: {
      OR: [
        { assigned_investigator_id: investigatorId },
        { investigators: { some: { investigator_id: investigatorId } } },
      ],
    },
    orderBy: { created_at: 'desc' },
    include: {
      complaint: { select: COMPLAINT_SUMMARY },
      assignedInvestigator: { select: INVESTIGATOR_SELECT },
    },
  });
}

export async function assignInvestigator(
  caseId: number,
  investigatorId: number
) {
  return prisma.case.update({
    where: { case_id: caseId },
    data: { assigned_investigator_id: investigatorId },
  });
}

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

export async function addStatusHistory(data: {
  case_id: number;
  status: CaseStatus;
  changed_by: number;
  note?: string | null;
}) {
  return prisma.caseStatusHistory.create({
    data: {
      case_id: data.case_id,
      status: data.status,
      changed_by: data.changed_by,
      note: data.note ?? null,
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
// Multi-investigator (junction table)
// -------------------------------------------------------------

/**
 * List all investigators assigned to a case (via junction table).
 */
export async function listCaseInvestigators(caseId: number) {
  const rows = await prisma.caseInvestigator.findMany({
    where: { case_id: caseId },
    orderBy: { assigned_at: 'asc' },
    include: {
      investigator: {
        select: INVESTIGATOR_SELECT,
      },
    },
  });

  return rows.map((r) => ({
    userId: r.investigator.user_id,
    name: r.investigator.name,
    email: r.investigator.email,
    assignedAt: r.assigned_at,
  }));
}

/**
 * Add an investigator to a case (idempotent).
 */
export async function addCaseInvestigator(
  caseId: number,
  investigatorId: number
) {
  return prisma.caseInvestigator.upsert({
    where: {
      case_id_investigator_id: {
        case_id: caseId,
        investigator_id: investigatorId,
      },
    },
    update: {},
    create: {
      case_id: caseId,
      investigator_id: investigatorId,
    },
  });
}

/**
 * Remove an investigator from a case.
 */
export async function removeCaseInvestigator(
  caseId: number,
  investigatorId: number
) {
  return prisma.caseInvestigator.deleteMany({
    where: {
      case_id: caseId,
      investigator_id: investigatorId,
    },
  });
}

/**
 * Replace all investigators on a case atomically.
 * Used when the manager saves the full checkbox list.
 */
export async function setCaseInvestigators(
  caseId: number,
  investigatorIds: number[]
) {
  return prisma.$transaction(async (tx) => {
    // Remove investigators not in the new list
    await tx.caseInvestigator.deleteMany({
      where: {
        case_id: caseId,
        investigator_id: { notIn: investigatorIds },
      },
    });

    // Add new ones
    for (const investigatorId of investigatorIds) {
      await tx.caseInvestigator.upsert({
        where: {
          case_id_investigator_id: {
            case_id: caseId,
            investigator_id: investigatorId,
          },
        },
        update: {},
        create: {
          case_id: caseId,
          investigator_id: investigatorId,
        },
      });
    }

    // Sync the primary field (assigned_investigator_id) to first investigator
    const primaryId =
      investigatorIds.length > 0 ? investigatorIds[0] : null;

    await tx.case.update({
      where: { case_id: caseId },
      data: { assigned_investigator_id: primaryId },
    });

    return { count: investigatorIds.length };
  });
}

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
    where: {
      OR: [
        { assigned_investigator_id: investigatorId },
        { investigators: { some: { investigator_id: investigatorId } } },
      ],
    },
  });
}

export async function countUnassignedCases(): Promise<number> {
  return prisma.case.count({
    where: {
      assigned_investigator_id: null,
      status: { notIn: ['CLOSED', 'ARCHIVED'] },
    },
  });
}

export async function countActiveCases(): Promise<number> {
  return prisma.case.count({
    where: {
      status: { in: ['OPEN', 'INVESTIGATING', 'PENDING_REVIEW'] },
    },
  });
}

/**
 * Count cases assigned to an investigator grouped by status.
 */
export async function countCasesForInvestigatorByStatus(investigatorId: number) {
  const rows = await prisma.case.groupBy({
    by: ['status'],
    where: {
      OR: [
        { assigned_investigator_id: investigatorId },
        { investigators: { some: { investigator_id: investigatorId } } },
      ],
    },
    _count: { _all: true },
  });

  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.status] = row._count._all;
  }
  return counts;
}

/**
 * Count reports submitted by investigator's cases.
 */
export async function countReportsForInvestigator(
  investigatorId: number
): Promise<number> {
  return prisma.investigationReport.count({
    where: {
      case: {
        OR: [
          { assigned_investigator_id: investigatorId },
          { investigators: { some: { investigator_id: investigatorId } } },
        ],
      },
    },
  });
}

/**
 * Get recent active cases assigned to an investigator.
 */
export async function getRecentCasesForInvestigator(
  investigatorId: number,
  limit = 5
) {
  return prisma.case.findMany({
    where: {
      OR: [
        { assigned_investigator_id: investigatorId },
        { investigators: { some: { investigator_id: investigatorId } } },
      ],
      status: { notIn: ['CLOSED', 'ARCHIVED'] },
    },
    orderBy: { updated_at: 'desc' },
    take: limit,
    include: {
      complaint: { select: COMPLAINT_SUMMARY },
      assignedInvestigator: { select: INVESTIGATOR_SELECT },
    },
  });
}