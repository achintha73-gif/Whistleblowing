import { prisma } from '@/lib/db';
import type { ComplaintStatus } from '../types';

/**
 * Complaint Repository - DB access ONLY.
 */

const AUTHOR_SELECT = {
  user_id: true,
  name: true,
  email: true,
} as const;

export async function createComplaint(data: {
  title: string;
  description: string;
  category: string | null;
  isAnonymous: boolean;
  user_id: number | null;
}) {
  return prisma.complaint.create({
    data: {
      title: data.title,
      description: data.description,
      category: data.category,
      isAnonymous: data.isAnonymous,
      user_id: data.user_id,
    },
    include: {
      user: { select: AUTHOR_SELECT },
    },
  });
}

export async function findComplaintById(complaintId: number) {
  return prisma.complaint.findUnique({
    where: { complaint_id: complaintId },
    include: {
      user: { select: AUTHOR_SELECT },
    },
  });
}

export async function listComplaintsByUser(userId: number) {
  return prisma.complaint.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
    include: {
      user: { select: AUTHOR_SELECT },
    },
  });
}

export async function listAllComplaints(filter?: {
  status?: ComplaintStatus;
}) {
  return prisma.complaint.findMany({
    where: filter?.status ? { status: filter.status } : undefined,
    orderBy: { created_at: 'desc' },
    include: {
      user: { select: AUTHOR_SELECT },
    },
  });
}

export async function countComplaintsByStatus() {
  const rows = await prisma.complaint.groupBy({
    by: ['status'],
    _count: { _all: true },
  });

  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.status] = row._count._all;
  }
  return counts;
}

export async function countAllComplaints(): Promise<number> {
  return prisma.complaint.count();
}

export async function countUserComplaintsByStatus(userId: number) {
  const rows = await prisma.complaint.groupBy({
    by: ['status'],
    where: { user_id: userId },
    _count: { _all: true },
  });

  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.status] = row._count._all;
  }
  return counts;
}

export async function getRecentUserComplaints(
  userId: number,
  limit: number = 5
) {
  return prisma.complaint.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
    take: limit,
    include: {
      user: { select: AUTHOR_SELECT },
    },
  });
}

/**
 * Get most recent N complaints with a given status.
 * Used by manager dashboard for "Pending Review" preview.
 */
export async function getRecentComplaintsByStatus(
  status: ComplaintStatus,
  limit = 5
) {
  return prisma.complaint.findMany({
    where: { status },
    orderBy: { created_at: 'desc' },
    take: limit,
    include: {
      user: { select: AUTHOR_SELECT },
    },
  });
}