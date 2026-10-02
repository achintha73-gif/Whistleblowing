// -------------------------------------------------------------
// Case Feature - Type Definitions
// -------------------------------------------------------------

/**
 * Case status - must match CaseStatus enum in Prisma.
 */
export const CASE_STATUS = {
  OPEN: 'OPEN',
  INVESTIGATING: 'INVESTIGATING',
  PENDING_REVIEW: 'PENDING_REVIEW',
  CLOSED: 'CLOSED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type CaseStatus = (typeof CASE_STATUS)[keyof typeof CASE_STATUS];

/**
 * Case priority - must match CasePriority enum in Prisma.
 */
export const CASE_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

export type CasePriority = (typeof CASE_PRIORITY)[keyof typeof CASE_PRIORITY];

/**
 * Human-readable labels for status.
 */
export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  OPEN: 'Open',
  INVESTIGATING: 'Investigating',
  PENDING_REVIEW: 'Pending Review',
  CLOSED: 'Closed',
  ARCHIVED: 'Archived',
};

/**
 * Human-readable labels for priority.
 */
export const CASE_PRIORITY_LABELS: Record<CasePriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

// -------------------------------------------------------------
// DTOs
// -------------------------------------------------------------

/**
 * Summary info for case lists.
 */
export interface CaseSummary {
  caseId: number;
  complaintId: number;
  complaintTitle: string;
  status: CaseStatus;
  priority: CasePriority;
  assignedInvestigator: {
    userId: number;
    name: string;
  } | null;
  createdAt: Date;
}

/**
 * Full case detail.
 */
export interface CaseDetail {
  caseId: number;
  complaintId: number;
  complaintTitle: string;
  complaintDescription: string;
  complaintCategory: string | null;
  complaintIsAnonymous: boolean;
  status: CaseStatus;
  priority: CasePriority;
  assignedInvestigator: {
    userId: number;
    name: string;
    email: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
  closedAt: Date | null;
}

/**
 * Input for creating a case from a complaint.
 */
export interface CreateCaseInput {
  complaintId: number;
  priority?: CasePriority;
}

/**
 * Input for assigning an investigator.
 */
export interface AssignInvestigatorInput {
  caseId: number;
  investigatorId: number;
}

/**
 * Input for updating status.
 */
export interface UpdateCaseStatusInput {
  caseId: number;
  status: CaseStatus;
}