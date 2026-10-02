import type { SafeUser } from '@/features/auth/types';
import type { EvidenceDTO, CreateEvidenceInput } from '../types';
import * as evidenceRepo from '../repository/evidence.repository';
import * as caseRepo from '@/features/cases/repository/case.repository';

// -------------------------------------------------------------
// Prisma -> DTO
// -------------------------------------------------------------

type PrismaEvidenceRow = {
  evidence_id: number;
  case_id: number;
  file_name: string;
  file_type: string;
  description: string | null;
  uploaded_at: Date;
};

export function toEvidenceDTO(row: PrismaEvidenceRow): EvidenceDTO {
  return {
    evidenceId: row.evidence_id,
    caseId: row.case_id,
    fileName: row.file_name,
    fileType: row.file_type,
    description: row.description,
    uploadedAt: row.uploaded_at,
  };
}

// -------------------------------------------------------------
// Permission helper
// -------------------------------------------------------------

/**
 * Check if the user can view evidence on a case.
 * - MANAGER / ADMIN: yes
 * - INVESTIGATOR: only if assigned to this case
 * - USER: no
 */
export async function canViewEvidence(
  user: SafeUser,
  caseId: number
): Promise<boolean> {
  const caseRow = await caseRepo.findCaseById(caseId);
  if (!caseRow) return false;

  if (user.roleName === 'MANAGER' || user.roleName === 'ADMIN') {
    return true;
  }

  if (user.roleName === 'INVESTIGATOR') {
    return caseRow.assigned_investigator_id === user.userId;
  }

  return false;
}

/**
 * Check if the user can ADD evidence on a case.
 * - INVESTIGATOR: only if assigned
 * - MANAGER / ADMIN: no (evidence collection is investigator's job)
 * - USER: no
 */
export async function canAddEvidence(
  user: SafeUser,
  caseId: number
): Promise<boolean> {
  if (user.roleName !== 'INVESTIGATOR') return false;

  const caseRow = await caseRepo.findCaseById(caseId);
  if (!caseRow) return false;

  return caseRow.assigned_investigator_id === user.userId;
}

// -------------------------------------------------------------
// Add Evidence
// -------------------------------------------------------------

export interface AddEvidenceResult {
  success: true;
  evidence: EvidenceDTO;
}

export interface AddEvidenceError {
  success: false;
  error: string;
}

export async function addEvidence(
  user: SafeUser,
  input: CreateEvidenceInput
): Promise<AddEvidenceResult | AddEvidenceError> {
  const caseRow = await caseRepo.findCaseById(input.caseId);
  if (!caseRow) {
    return { success: false, error: 'Case not found' };
  }

  if (user.roleName !== 'INVESTIGATOR') {
    return {
      success: false,
      error: 'Only investigators can add evidence',
    };
  }

  if (caseRow.assigned_investigator_id !== user.userId) {
    return {
      success: false,
      error: 'You are not assigned to this case',
    };
  }

  if (caseRow.status === 'CLOSED' || caseRow.status === 'ARCHIVED') {
    return {
      success: false,
      error: 'Cannot add evidence to a closed case',
    };
  }

  const created = await evidenceRepo.createEvidence({
    case_id: input.caseId,
    file_name: input.fileName,
    file_type: input.fileType,
    description: input.description?.trim() || null,
  });

  return {
    success: true,
    evidence: toEvidenceDTO(created),
  };
}

// -------------------------------------------------------------
// List Evidence
// -------------------------------------------------------------

export async function getEvidenceForCase(
  user: SafeUser,
  caseId: number
): Promise<EvidenceDTO[]> {
  const allowed = await canViewEvidence(user, caseId);
  if (!allowed) {
    return [];
  }

  const rows = await evidenceRepo.listEvidenceForCase(caseId);
  return rows.map(toEvidenceDTO);
}