// -------------------------------------------------------------
// Investigation Feature - Type Definitions
// -------------------------------------------------------------

/**
 * Investigation report for a case.
 * One report per case (unique constraint on case_id).
 */
export interface InvestigationReportDTO {
  reportId: number;
  caseId: number;
  findings: string;
  recommendation: string;
  createdAt: Date;
}

/**
 * Input for creating/updating a report.
 */
export interface UpsertReportInput {
  caseId: number;
  findings: string;
  recommendation: string;
}