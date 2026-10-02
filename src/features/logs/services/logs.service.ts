import type { LogEntry, LogEventType } from '../types';
import { LOG_EVENT_TYPES } from '../types';
import * as repo from '../repository/logs.repository';

// -------------------------------------------------------------
// Build unified log entries
// -------------------------------------------------------------

/**
 * Fetch log entries from all sources, merge them, and sort by timestamp desc.
 * Returns at most `limit` entries across all types.
 */
export async function getActivityLog(limit = 100): Promise<LogEntry[]> {
  const [
    complaints,
    cases,
    statusChanges,
    evidence,
    reports,
    additionalInfo,
    users,
  ] = await Promise.all([
    repo.getRecentComplaints(limit),
    repo.getRecentCases(limit),
    repo.getRecentStatusChanges(limit),
    repo.getRecentEvidence(limit),
    repo.getRecentReports(limit),
    repo.getRecentAdditionalInfo(limit),
    repo.getRecentUsers(limit),
  ]);

  const entries: LogEntry[] = [];

  // Complaint submissions
  for (const c of complaints) {
    const actorName = c.isAnonymous ? null : (c.user?.name ?? null);
    const actorRole = c.isAnonymous
      ? null
      : (c.user?.role?.role_name ?? null);
    entries.push({
      id: `complaint-${c.complaint_id}`,
      type: LOG_EVENT_TYPES.COMPLAINT_SUBMITTED,
      timestamp: c.created_at,
      actorName,
      actorRole,
      description: c.isAnonymous
        ? `Anonymous complaint submitted: "${truncate(c.title)}"`
        : `Complaint submitted: "${truncate(c.title)}"`,
      linkTo: `/dashboard/complaints/${c.complaint_id}`,
      entityRef: `Complaint #${c.complaint_id}`,
    });
  }

  // Case creations
  for (const c of cases) {
    entries.push({
      id: `case-created-${c.case_id}`,
      type: LOG_EVENT_TYPES.CASE_CREATED,
      timestamp: c.created_at,
      actorName: null,
      actorRole: null,
      description: `Case created from complaint: "${truncate(
        c.complaint.title
      )}"`,
      linkTo: `/dashboard/cases/${c.case_id}`,
      entityRef: `Case #${c.case_id}`,
    });
  }

  // Case status changes
  for (const s of statusChanges) {
    entries.push({
      id: `status-${s.history_id}`,
      type: LOG_EVENT_TYPES.CASE_STATUS_CHANGED,
      timestamp: s.changed_at,
      actorName: s.changedBy?.name ?? null,
      actorRole: s.changedBy?.role?.role_name ?? null,
      description: `Case status changed to ${s.status.replace('_', ' ')}`,
      linkTo: `/dashboard/cases/${s.case_id}`,
      entityRef: `Case #${s.case_id}`,
    });
  }

  // Evidence uploads
  for (const e of evidence) {
    const investigator = e.case?.assignedInvestigator;
    entries.push({
      id: `evidence-${e.evidence_id}`,
      type: LOG_EVENT_TYPES.EVIDENCE_ADDED,
      timestamp: e.uploaded_at,
      actorName: investigator?.name ?? null,
      actorRole: investigator?.role?.role_name ?? null,
      description: `Evidence uploaded: "${truncate(e.file_name, 40)}"`,
      linkTo: `/dashboard/cases/${e.case_id}`,
      entityRef: `Case #${e.case_id}`,
    });
  }

  // Reports
  for (const r of reports) {
    const investigator = r.case?.assignedInvestigator;
    entries.push({
      id: `report-${r.report_id}`,
      type: LOG_EVENT_TYPES.REPORT_SUBMITTED,
      timestamp: r.created_at,
      actorName: investigator?.name ?? null,
      actorRole: investigator?.role?.role_name ?? null,
      description: `Investigation report submitted`,
      linkTo: `/dashboard/cases/${r.case_id}`,
      entityRef: `Case #${r.case_id}`,
    });
  }

  // Additional information
  for (const a of additionalInfo) {
    entries.push({
      id: `ai-${a.info_id}`,
      type: LOG_EVENT_TYPES.ADDITIONAL_INFO_SUBMITTED,
      timestamp: a.submitted_at,
      actorName: a.submittedBy?.name ?? null,
      actorRole: a.submittedBy?.role?.role_name ?? null,
      description: `Additional info: "${truncate(a.title)}"`,
      linkTo: `/dashboard/complaints/${a.complaint_id}`,
      entityRef: `Complaint #${a.complaint_id}`,
    });
  }

  // User signups
  for (const u of users) {
    entries.push({
      id: `user-${u.user_id}`,
      type: LOG_EVENT_TYPES.USER_CREATED,
      timestamp: u.created_at,
      actorName: u.name,
      actorRole: u.role?.role_name ?? null,
      description: `New user account created`,
      linkTo: `/dashboard/users`,
      entityRef: `User #${u.user_id}`,
    });
  }

  // Sort desc by timestamp
  entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return entries.slice(0, limit);
}

// -------------------------------------------------------------
// Helpers
// -------------------------------------------------------------

function truncate(text: string, max = 60): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + '…';
}

// -------------------------------------------------------------
// Stats
// -------------------------------------------------------------

export interface LogStats {
  total: number;
  byType: Record<LogEventType, number>;
}

export async function getLogStats(): Promise<LogStats> {
  const entries = await getActivityLog(500);
  const byType: Record<string, number> = {};
  for (const e of entries) {
    byType[e.type] = (byType[e.type] ?? 0) + 1;
  }
  return {
    total: entries.length,
    byType: byType as Record<LogEventType, number>,
  };
}