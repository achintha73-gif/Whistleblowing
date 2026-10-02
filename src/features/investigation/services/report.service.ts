import type { SafeUser } from '@/features/auth/types';
import type { InvestigationReportDTO, UpsertReportInput } from '../types';
import * as reportRepo from '../repository/report.repository';
import * as caseRepo from '@/features/cases/repository/case.repository';

// -------------------------------------------------------------
// Prisma -> DTO
// -------------------------------------------------------------

type PrismaReportRow = {
  report_id: number;
  case_id: number;
  findings: string;
  recommendation: string;
  created_at: Date;
};

export function toReportDTO(row: PrismaReportRow): InvestigationReportDTO {
  return {
    reportId: row.report_id,
    caseId: row.case_id,
    findings: row.findings,
    recommendation: row.recommendation,
    createdAt: row.created_at,
  };
}

// -------------------------------------------------------------
// Permission helpers
// -------------------------------------------------------------

/**
 * Manager, Admin, and assigned Investigator can view the report.
 */
export async function canViewReport(
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
 * Only assigned investigator can create/update the report.
 */
export async function canUpsertReport(
  user: SafeUser,
  caseId: number
): Promise<boolean> {
  if (user.roleName !== 'INVESTIGATOR') return false;

  const caseRow = await caseRepo.findCaseById(caseId);
  if (!caseRow) return false;

  return caseRow.assigned_investigator_id === user.userId;
}

// -------------------------------------------------------------
// Get Report
// -------------------------------------------------------------

export async function getReportForCase(
  user: SafeUser,
  caseId: number
): Promise<InvestigationReportDTO | null> {
  const allowed = await canViewReport(user, caseId);
  if (!allowed) return null;

  const row = await reportRepo.findReportByCaseId(caseId);
  if (!row) return null;

  return toReportDTO(row);
}

// -------------------------------------------------------------
// Upsert Report (create OR update)
// -------------------------------------------------------------

export interface UpsertReportResult {
  success: true;
  report: InvestigationReportDTO;
}

export interface UpsertReportError {
  success: false;
  error: string;
}

export async function upsertReport(
  user: SafeUser,
  input: UpsertReportInput
): Promise<UpsertReportResult | UpsertReportError> {
  const caseRow = await caseRepo.findCaseById(input.caseId);
  if (!caseRow) {
    return { success: false, error: 'Case not found' };
  }

  if (user.roleName !== 'INVESTIGATOR') {
    return { success: false, error: 'Only investigators can write reports' };
  }

  if (caseRow.assigned_investigator_id !== user.userId) {
    return { success: false, error: 'You are not assigned to this case' };
  }

  if (caseRow.status === 'CLOSED' || caseRow.status === 'ARCHIVED') {
    return {
      success: false,
      error: 'Cannot modify report on a closed case',
    };
  }

  const existing = await reportRepo.findReportByCaseId(input.caseId);

  let saved;
  if (existing) {
    saved = await reportRepo.updateReport(existing.report_id, {
      findings: input.findings,
      recommendation: input.recommendation,
    });
  } else {
    saved = await reportRepo.createReport({
      case_id: input.caseId,
      findings: input.findings,
      recommendation: input.recommendation,
    });
  }

  return { success: true, report: toReportDTO(saved) };
}