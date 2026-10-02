import { prisma } from '@/lib/db';
import type { ComplaintStatus } from '../types';

/**
 * Complaint Repository - DB access ONLY.
 * No business logic. No auth checks. No Zod.
 */

const AUTHOR_SELECT = {
  user_id: true,
  name: true,
  email: true,
} as const;

/**
 * Create a new complaint.
 * If anonymous, pass user_id = null.
 */
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

/**
 * Find a complaint by its ID, including the author.
 * Returns null if not found.
 */
export async function findComplaintById(complaintId: number) {
  return prisma.complaint.findUnique({
    where: { complaint_id: complaintId },
    include: {
      user: { select: AUTHOR_SELECT },
    },
  });
}

/**
 * List all complaints submitted by a specific user.
 * Ordered newest first.
 */
export async function listComplaintsByUser(userId: number) {
  return prisma.complaint.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
    include: {
      user: { select: AUTHOR_SELECT },
    },
  });
}

/**
 * List all complaints in the system.
 * For managers/admins.
 * Optional filter by status.
 */
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

/**
 * Count complaints grouped by status.
 * Useful for dashboard widgets later.
 */
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

/**
 * Count all complaints.
 */
export async function countAllComplaints(): Promise<number> {
  return prisma.complaint.count();
}

/**
 * Count complaints for a specific user, grouped by status.
 */
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

/**
 * Get the most recent N complaints for a user.
 */
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