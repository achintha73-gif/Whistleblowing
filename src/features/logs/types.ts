// -------------------------------------------------------------
// Activity Log Feature - Type Definitions
// -------------------------------------------------------------

/**
 * Event types shown in the activity log.
 */
export const LOG_EVENT_TYPES = {
  COMPLAINT_SUBMITTED: 'COMPLAINT_SUBMITTED',
  CASE_CREATED: 'CASE_CREATED',
  CASE_STATUS_CHANGED: 'CASE_STATUS_CHANGED',
  INVESTIGATOR_ASSIGNED: 'INVESTIGATOR_ASSIGNED',
  EVIDENCE_ADDED: 'EVIDENCE_ADDED',
  REPORT_SUBMITTED: 'REPORT_SUBMITTED',
  ADDITIONAL_INFO_SUBMITTED: 'ADDITIONAL_INFO_SUBMITTED',
  USER_CREATED: 'USER_CREATED',
} as const;

export type LogEventType =
  (typeof LOG_EVENT_TYPES)[keyof typeof LOG_EVENT_TYPES];

/**
 * Human-readable labels per event type (for filter chips + table).
 */
export const LOG_EVENT_LABELS: Record<LogEventType, string> = {
  COMPLAINT_SUBMITTED: 'Complaint',
  CASE_CREATED: 'Case',
  CASE_STATUS_CHANGED: 'Status',
  INVESTIGATOR_ASSIGNED: 'Assignment',
  EVIDENCE_ADDED: 'Evidence',
  REPORT_SUBMITTED: 'Report',
  ADDITIONAL_INFO_SUBMITTED: 'Additional Info',
  USER_CREATED: 'User',
};

/**
 * A single log entry (unified across event types).
 */
export interface LogEntry {
  id: string;
  type: LogEventType;
  timestamp: Date;
  actorName: string | null;
  actorRole: string | null;
  description: string;
  linkTo: string | null;
  /** Quick reference like "Case #1" or "Complaint #3" */
  entityRef: string | null;
}