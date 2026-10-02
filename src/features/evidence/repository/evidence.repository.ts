import { prisma } from '@/lib/db';

/**
 * Evidence Repository - DB access ONLY.
 */

/**
 * Create evidence for a case.
 */
export async function createEvidence(data: {
  case_id: number;
  file_name: string;
  file_type: string;
  description: string | null;
}) {
  return prisma.evidence.create({
    data: {
      case_id: data.case_id,
      file_name: data.file_name,
      file_type: data.file_type,
      description: data.description,
    },
  });
}

/**
 * List all evidence for a case, newest first.
 */
export async function listEvidenceForCase(caseId: number) {
  return prisma.evidence.findMany({
    where: { case_id: caseId },
    orderBy: { uploaded_at: 'desc' },
  });
}

/**
 * Find a single evidence item by ID.
 */
export async function findEvidenceById(evidenceId: number) {
  return prisma.evidence.findUnique({
    where: { evidence_id: evidenceId },
  });
}

/**
 * Count evidence items for a case.
 */
export async function countEvidenceForCase(caseId: number): Promise<number> {
  return prisma.evidence.count({ where: { case_id: caseId } });
}