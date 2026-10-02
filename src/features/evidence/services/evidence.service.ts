import type { SafeUser } from '@/features/auth/types';
import type { EvidenceDTO, CreateEvidenceInput } from '../types';
import * as evidenceRepo from '../repository/evidence.repository';
import * as caseRepo from '@/features/cases/repository/case.repository';
import {
  notifyUser,
  getManagerForCase,
} from '@/features/notifications/services/notification.service';

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
  file_path: string | null;
};

export function toEvidenceDTO(row: PrismaEvidenceRow): EvidenceDTO {
  return {
    evidenceId: row.evidence_id,
    caseId: row.case_id,
    fileName: row.file_name,
    fileType: row.file_type,
    description: row.description,
    uploadedAt: row.uploaded_at,
    hasFile: !!row.file_path,
  };
}

// -------------------------------------------------------------
// Permission helpers
// -------------------------------------------------------------

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
// Add Evidence (metadata-only, used internally / legacy)
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
    file_path: null,
  });

  const managerId = await getManagerForCase(input.caseId);
  await notifyUser(
    managerId,
    `Investigator ${user.name} added evidence "${input.fileName}" to Case #${input.caseId}.`
  );

  return {
    success: true,
    evidence: toEvidenceDTO(created),
  };
}

// -------------------------------------------------------------
// Add Evidence with file (upload)
// -------------------------------------------------------------

export interface AddEvidenceWithFileInput {
  caseId: number;
  fileName: string;
  fileType: string;
  description: string | null;
  filePath: string;
}

export async function addEvidenceWithFile(
  user: SafeUser,
  input: AddEvidenceWithFileInput
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
    description: input.description,
    file_path: input.filePath,
  });

  const managerId = await getManagerForCase(input.caseId);
  await notifyUser(
    managerId,
    `Investigator ${user.name} uploaded evidence "${input.fileName}" to Case #${input.caseId}.`
  );

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

// -------------------------------------------------------------
// Evidence Overview
// -------------------------------------------------------------

export interface CaseEvidenceGroup {
  caseId: number;
  complaintTitle: string;
  evidence: EvidenceDTO[];
}

export async function getEvidenceOverviewForInvestigator(
  user: SafeUser
): Promise<CaseEvidenceGroup[]> {
  if (user.roleName !== 'INVESTIGATOR') return [];

  const rows = await evidenceRepo.getEvidenceByInvestigator(user.userId);

  return rows.map((row) => ({
    caseId: row.case_id,
    complaintTitle: row.complaint.title,
    evidence: row.evidence.map((e) => toEvidenceDTO(e as PrismaEvidenceRow)),
  }));
}

// -------------------------------------------------------------
// Get single evidence (for download route)
// -------------------------------------------------------------

export async function getEvidenceByIdForUser(
  user: SafeUser,
  evidenceId: number
): Promise<{
  evidence: {
    evidenceId: number;
    caseId: number;
    fileName: string;
    fileType: string;
    filePath: string | null;
  };
} | null> {
  const row = await evidenceRepo.findEvidenceById(evidenceId);
  if (!row) return null;

  // Check view permission on the case
  const allowed = await canViewEvidence(user, row.case_id);
  if (!allowed) return null;

  return {
    evidence: {
      evidenceId: row.evidence_id,
      caseId: row.case_id,
      fileName: row.file_name,
      fileType: row.file_type,
      filePath: row.file_path,
    },
  };
}