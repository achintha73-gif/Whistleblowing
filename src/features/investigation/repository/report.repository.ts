import { prisma } from '@/lib/db';

/**
 * Investigation Report Repository - DB access ONLY.
 */

export async function createReport(data: {
  case_id: number;
  findings: string;
  recommendation: string;
}) {
  return prisma.investigationReport.create({
    data: {
      case_id: data.case_id,
      findings: data.findings,
      recommendation: data.recommendation,
    },
  });
}

export async function updateReport(
  reportId: number,
  data: {
    findings: string;
    recommendation: string;
  }
) {
  return prisma.investigationReport.update({
    where: { report_id: reportId },
    data: {
      findings: data.findings,
      recommendation: data.recommendation,
    },
  });
}

/**
 * Find report by case ID (1:1 relation).
 */
export async function findReportByCaseId(caseId: number) {
  return prisma.investigationReport.findUnique({
    where: { case_id: caseId },
  });
}

export async function deleteReport(reportId: number) {
  return prisma.investigationReport.delete({
    where: { report_id: reportId },
  });
}