import type { SafeUser } from '@/features/auth/types';
import type { EvidenceDTO, CreateComplaintEvidenceInput } from '../types';
import { prisma } from '@/lib/db';
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
  case_id: number | null;
  complaint_id: number | null;
  file_name: string;
  file_type: string;
  file_size: number | null;
  description: string | null;
  uploaded_at: Date;
  file_path: string | null;
  uploaded_by: number | null;
  uploader: {
    user_id: number;
    name: string;
    role: { role_name: string };
  } | null;
};

export function toEvidenceDTO(row: PrismaEvidenceRow): EvidenceDTO {
  const source: 'complaint' | 'case' = row.complaint_id
    ? 'complaint'
    : 'case';

  return {
    evidenceId: row.evidence_id,
    complaintId: row.complaint_id,
    caseId: row.case_id,
    source,
    fileName: row.file_name,
    fileType: row.file_type,
    fileSize: row.file_size,
    description: row.description,
    uploadedAt: row.uploaded_at,
    hasFile: !!row.file_path,
    uploadedBy: row.uploader
      ? {
          userId: row.uploader.user_id,
          name: row.uploader.name,
          roleName: row.uploader.role.role_name,
        }
      : null,
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
// Add evidence to a CASE (investigator)
// -------------------------------------------------------------

export interface AddEvidenceResult {
  success: true;
  evidence: EvidenceDTO;
}

export interface AddEvidenceError {
  success: false;
  error: string;
}

export interface AddCaseEvidenceInput {
  caseId: number;
  fileName: string;
  fileType: string;
  fileSize: number | null;
  description: string | null;
  filePath: string;
}

export async function addEvidenceWithFile(
  user: SafeUser,
  input: AddCaseEvidenceInput
): Promise<AddEvidenceResult | AddEvidenceError> {
  const caseRow = await caseRepo.findCaseById(input.caseId);
  if (!caseRow) {
    return { success: false, error: 'Case not found' };
  }

  if (user.roleName !== 'INVESTIGATOR') {
    return {
      success: false,
      error: 'Only investigators can add evidence to a case',
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
    complaint_id: null,
    file_name: input.fileName,
    file_type: input.fileType,
    file_size: input.fileSize,
    description: input.description,
    file_path: input.filePath,
    uploaded_by: user.userId,
  });

  const managerId = await getManagerForCase(input.caseId);
  await notifyUser(
    managerId,
    `Investigator ${user.name} uploaded evidence "${input.fileName}" to Case #${input.caseId}.`
  );

  return {
    success: true,
    evidence: toEvidenceDTO(created as unknown as PrismaEvidenceRow),
  };
}

// -------------------------------------------------------------
// Add evidence to a COMPLAINT (employee)
// -------------------------------------------------------------

export async function addComplaintEvidence(
  input: CreateComplaintEvidenceInput
): Promise<AddEvidenceResult | AddEvidenceError> {
  const created = await evidenceRepo.createEvidence({
    case_id: null,
    complaint_id: input.complaintId,
    file_name: input.fileName,
    file_type: input.fileType,
    file_size: input.fileSize,
    description: input.description ?? null,
    file_path: input.filePath,
    uploaded_by: input.uploadedBy,
  });

  return {
    success: true,
    evidence: toEvidenceDTO(created as unknown as PrismaEvidenceRow),
  };
}

// -------------------------------------------------------------
// List evidence - by case (includes complaint evidence)
// -------------------------------------------------------------

export async function getEvidenceForCase(
  user: SafeUser,
  caseId: number
): Promise<EvidenceDTO[]> {
  const allowed = await canViewEvidence(user, caseId);
  if (!allowed) {
    return [];
  }

  const rows = await evidenceRepo.listEvidenceForCaseWithComplaint(caseId);
  return rows.map((r) => toEvidenceDTO(r as unknown as PrismaEvidenceRow));
}

// -------------------------------------------------------------
// List evidence - by complaint
// -------------------------------------------------------------

export async function getEvidenceForComplaint(
  user: SafeUser,
  complaintId: number
): Promise<EvidenceDTO[]> {
  const rows = await evidenceRepo.listEvidenceForComplaint(complaintId);
  return rows.map((r) => toEvidenceDTO(r as unknown as PrismaEvidenceRow));
}

// -------------------------------------------------------------
// Evidence Overview (investigator dashboard)
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
    evidence: row.evidence.map((e) =>
      toEvidenceDTO(e as unknown as PrismaEvidenceRow)
    ),
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
    caseId: number | null;
    complaintId: number | null;
    fileName: string;
    fileType: string;
    filePath: string | null;
  };
} | null> {
  const row = await evidenceRepo.findEvidenceById(evidenceId);
  if (!row) return null;

  if (row.case_id) {
    const allowed = await canViewEvidence(user, row.case_id);
    if (!allowed) return null;
  } else if (row.complaint_id) {
    const isStaff =
      user.roleName === 'MANAGER' ||
      user.roleName === 'INVESTIGATOR' ||
      user.roleName === 'ADMIN';

    if (!isStaff) {
      const complaint = await prisma.complaint.findUnique({
        where: { complaint_id: row.complaint_id },
        select: { user_id: true, isAnonymous: true },
      });
      if (!complaint) return null;
      if (complaint.user_id !== user.userId) return null;
    }
  } else {
    if (user.roleName !== 'ADMIN') return null;
  }

  return {
    evidence: {
      evidenceId: row.evidence_id,
      caseId: row.case_id,
      complaintId: row.complaint_id,
      fileName: row.file_name,
      fileType: row.file_type,
      filePath: row.file_path,
    },
  };
}

// -------------------------------------------------------------
// Check if user can delete evidence
// -------------------------------------------------------------

/**
 * Rules:
 *  - USER role: can delete complaint evidence they uploaded themselves
 *    AND only if the source complaint has NOT been converted to a case
 *  - ADMIN: can delete any complaint evidence (emergency only)
 *  - Everyone else: cannot delete
 */
export async function canDeleteEvidence(
  user: SafeUser,
  evidenceId: number
): Promise<boolean> {
  const row = await evidenceRepo.findEvidenceById(evidenceId);
  if (!row) return false;

  // Only complaint evidence can be deleted (never case evidence)
  if (!row.complaint_id) return false;

  // Check if the source complaint has been converted to a case
  const complaint = await prisma.complaint.findUnique({
    where: { complaint_id: row.complaint_id },
    select: { status: true, user_id: true },
  });
  if (!complaint) return false;

  // Block deletion once the complaint has been converted to a case
  if (complaint.status === 'CONVERTED_TO_CASE') return false;

  // ADMIN can delete for moderation
  if (user.roleName === 'ADMIN') return true;

  // USER can delete only their own evidence
  if (user.roleName === 'USER') {
    return row.uploaded_by === user.userId;
  }

  return false;
}

// -------------------------------------------------------------
// Delete evidence
// -------------------------------------------------------------

export async function deleteEvidence(
  user: SafeUser,
  evidenceId: number
): Promise<{ success: true } | { success: false; error: string }> {
  const allowed = await canDeleteEvidence(user, evidenceId);
  if (!allowed) {
    return {
      success: false,
      error: 'You cannot delete this evidence',
    };
  }

  await prisma.evidence.delete({
    where: { evidence_id: evidenceId },
  });

  return { success: true };
}