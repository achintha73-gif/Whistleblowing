import { prisma } from '@/lib/db';

/**
 * Evidence Repository - DB access ONLY.
 */

// -------------------------------------------------------------
// Create
// -------------------------------------------------------------

export async function createEvidence(data: {
  case_id: number | null;
  complaint_id: number | null;
  file_name: string;
  file_type: string;
  file_size: number | null;
  description: string | null;
  file_path: string | null;
  uploaded_by: number | null;
}) {
  return prisma.evidence.create({
    data,
  });
}

// -------------------------------------------------------------
// Read - by case
// -------------------------------------------------------------

export async function listEvidenceForCase(caseId: number) {
  return prisma.evidence.findMany({
    where: { case_id: caseId },
    orderBy: { uploaded_at: 'desc' },
    include: {
      uploader: {
        select: {
          user_id: true,
          name: true,
          role: { select: { role_name: true } },
        },
      },
    },
  });
}

/**
 * Get evidence for a case PLUS evidence on its source complaint.
 * Used by manager/investigator when viewing a case — they see both
 * investigator-uploaded evidence (case-linked) AND employee-uploaded
 * evidence from the complaint.
 */
export async function listEvidenceForCaseWithComplaint(caseId: number) {
  const caseRow = await prisma.case.findUnique({
    where: { case_id: caseId },
    select: { complaint_id: true },
  });

  if (!caseRow) return [];

  return prisma.evidence.findMany({
    where: {
      OR: [
        { case_id: caseId },
        { complaint_id: caseRow.complaint_id },
      ],
    },
    orderBy: { uploaded_at: 'desc' },
    include: {
      uploader: {
        select: {
          user_id: true,
          name: true,
          role: { select: { role_name: true } },
        },
      },
    },
  });
}

// -------------------------------------------------------------
// Read - by complaint
// -------------------------------------------------------------

export async function listEvidenceForComplaint(complaintId: number) {
  return prisma.evidence.findMany({
    where: { complaint_id: complaintId },
    orderBy: { uploaded_at: 'desc' },
    include: {
      uploader: {
        select: {
          user_id: true,
          name: true,
          role: { select: { role_name: true } },
        },
      },
    },
  });
}

// -------------------------------------------------------------
// Read - single
// -------------------------------------------------------------

export async function findEvidenceById(evidenceId: number) {
  return prisma.evidence.findUnique({
    where: { evidence_id: evidenceId },
    include: {
      uploader: {
        select: {
          user_id: true,
          name: true,
          role: { select: { role_name: true } },
        },
      },
    },
  });
}

// -------------------------------------------------------------
// Counts
// -------------------------------------------------------------

export async function countEvidenceForCase(caseId: number): Promise<number> {
  return prisma.evidence.count({ where: { case_id: caseId } });
}

export async function countEvidenceForComplaint(
  complaintId: number
): Promise<number> {
  return prisma.evidence.count({ where: { complaint_id: complaintId } });
}

// -------------------------------------------------------------
// Investigator overview
// -------------------------------------------------------------

export async function getEvidenceByInvestigator(investigatorId: number) {
  return prisma.case.findMany({
    where: { assigned_investigator_id: investigatorId },
    orderBy: { created_at: 'desc' },
    select: {
      case_id: true,
      complaint_id: true,
      complaint: {
        select: {
          title: true,
        },
      },
      evidence: {
        orderBy: { uploaded_at: 'desc' },
        include: {
          uploader: {
            select: {
              user_id: true,
              name: true,
              role: { select: { role_name: true } },
            },
          },
        },
      },
    },
  });
}