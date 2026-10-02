import { prisma } from '@/lib/db';

/**
 * Evidence Repository - DB access ONLY.
 */

export async function createEvidence(data: {
  case_id: number;
  file_name: string;
  file_type: string;
  description: string | null;
  file_path: string | null;
}) {
  return prisma.evidence.create({
    data: {
      case_id: data.case_id,
      file_name: data.file_name,
      file_type: data.file_type,
      description: data.description,
      file_path: data.file_path,
    },
  });
}

export async function listEvidenceForCase(caseId: number) {
  return prisma.evidence.findMany({
    where: { case_id: caseId },
    orderBy: { uploaded_at: 'desc' },
  });
}

export async function findEvidenceById(evidenceId: number) {
  return prisma.evidence.findUnique({
    where: { evidence_id: evidenceId },
  });
}

export async function countEvidenceForCase(caseId: number): Promise<number> {
  return prisma.evidence.count({ where: { case_id: caseId } });
}

export async function getEvidenceByInvestigator(investigatorId: number) {
  return prisma.case.findMany({
    where: { assigned_investigator_id: investigatorId },
    orderBy: { created_at: 'desc' },
    select: {
      case_id: true,
      complaint: {
        select: {
          title: true,
        },
      },
      evidence: {
        orderBy: { uploaded_at: 'desc' },
      },
    },
  });
}