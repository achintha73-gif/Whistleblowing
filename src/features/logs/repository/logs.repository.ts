import { prisma } from '@/lib/db';

/**
 * Logs Repository — READ-ONLY aggregation queries.
 * Each function returns raw rows; the service merges + sorts them.
 */

// -------------------------------------------------------------
// Complaints (submission events)
// -------------------------------------------------------------

export async function getRecentComplaints(limit = 50) {
  return prisma.complaint.findMany({
    orderBy: { created_at: 'desc' },
    take: limit,
    select: {
      complaint_id: true,
      title: true,
      isAnonymous: true,
      created_at: true,
      user: {
        select: {
          name: true,
          role: { select: { role_name: true } },
        },
      },
    },
  });
}

// -------------------------------------------------------------
// Cases (creation)
// -------------------------------------------------------------

export async function getRecentCases(limit = 50) {
  return prisma.case.findMany({
    orderBy: { created_at: 'desc' },
    take: limit,
    select: {
      case_id: true,
      created_at: true,
      complaint: {
        select: { title: true },
      },
    },
  });
}

// -------------------------------------------------------------
// Case status changes
// -------------------------------------------------------------

export async function getRecentStatusChanges(limit = 50) {
  return prisma.caseStatusHistory.findMany({
    orderBy: { changed_at: 'desc' },
    take: limit,
    select: {
      history_id: true,
      status: true,
      changed_at: true,
      case_id: true,
      changedBy: {
        select: {
          name: true,
          role: { select: { role_name: true } },
        },
      },
    },
  });
}

// -------------------------------------------------------------
// Evidence uploads
// -------------------------------------------------------------

export async function getRecentEvidence(limit = 50) {
  return prisma.evidence.findMany({
    orderBy: { uploaded_at: 'desc' },
    take: limit,
    select: {
      evidence_id: true,
      file_name: true,
      uploaded_at: true,
      case_id: true,
      case: {
        select: {
          assignedInvestigator: {
            select: {
              name: true,
              role: { select: { role_name: true } },
            },
          },
        },
      },
    },
  });
}

// -------------------------------------------------------------
// Investigation reports
// -------------------------------------------------------------

export async function getRecentReports(limit = 50) {
  return prisma.investigationReport.findMany({
    orderBy: { created_at: 'desc' },
    take: limit,
    select: {
      report_id: true,
      created_at: true,
      case_id: true,
      case: {
        select: {
          assignedInvestigator: {
            select: {
              name: true,
              role: { select: { role_name: true } },
            },
          },
        },
      },
    },
  });
}

// -------------------------------------------------------------
// Additional information
// -------------------------------------------------------------

export async function getRecentAdditionalInfo(limit = 50) {
  return prisma.additionalInformation.findMany({
    orderBy: { submitted_at: 'desc' },
    take: limit,
    select: {
      info_id: true,
      title: true,
      submitted_at: true,
      complaint_id: true,
      submittedBy: {
        select: {
          name: true,
          role: { select: { role_name: true } },
        },
      },
    },
  });
}

// -------------------------------------------------------------
// User signups
// -------------------------------------------------------------

export async function getRecentUsers(limit = 50) {
  return prisma.user.findMany({
    orderBy: { created_at: 'desc' },
    take: limit,
    select: {
      user_id: true,
      name: true,
      created_at: true,
      role: { select: { role_name: true } },
    },
  });
}