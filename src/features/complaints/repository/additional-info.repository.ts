import { prisma } from '@/lib/db';

/**
 * Additional Information Repository - DB access ONLY.
 */

const SUBMITTER_SELECT = {
  user_id: true,
  name: true,
} as const;

/**
 * Create additional information for a complaint.
 */
export async function createAdditionalInfo(data: {
  complaint_id: number;
  title: string;
  description: string;
  information_type: string;
  submitted_by: number;
}) {
  return prisma.additionalInformation.create({
    data: {
      complaint_id: data.complaint_id,
      title: data.title,
      description: data.description,
      informationType: data.information_type as 'ADDITIONAL_DETAILS' | 'CLARIFICATION' | 'SUPPORTING_INFO' | 'CORRECTION',
      submitted_by: data.submitted_by,
    },
    include: {
      submittedBy: { select: SUBMITTER_SELECT },
    },
  });
}

/**
 * List all additional info for a complaint, newest first.
 */
export async function listAdditionalInfoForComplaint(complaintId: number) {
  return prisma.additionalInformation.findMany({
    where: { complaint_id: complaintId },
    orderBy: { submitted_at: 'desc' },
    include: {
      submittedBy: { select: SUBMITTER_SELECT },
    },
  });
}

/**
 * Count additional info entries for a complaint.
 */
export async function countAdditionalInfoForComplaint(
  complaintId: number
): Promise<number> {
  return prisma.additionalInformation.count({
    where: { complaint_id: complaintId },
  });
}