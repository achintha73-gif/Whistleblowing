import type { RoleName, SafeUser } from '@/features/auth/types';
import type {
  ComplaintDTO,
  ComplaintSummary,
  CreateComplaintInput,
} from '../types';
import * as repo from '../repository/complaint.repository';
import { prisma } from '@/lib/db';

// -------------------------------------------------------------
// Prisma -> DTO mapper
// -------------------------------------------------------------

type PrismaComplaintRow = {
  complaint_id: number;
  title: string;
  description: string;
  category: string | null;
  status: string;
  isAnonymous: boolean;
  created_at: Date;
  updated_at: Date;
  user: {
    user_id: number;
    name: string;
    email: string;
  } | null;
};

export function toComplaintDTO(row: PrismaComplaintRow): ComplaintDTO {
  const author =
    !row.isAnonymous && row.user
      ? {
          userId: row.user.user_id,
          name: row.user.name,
          email: row.user.email,
        }
      : null;

  return {
    complaintId: row.complaint_id,
    title: row.title,
    description: row.description,
    category: row.category,
    status: row.status as ComplaintDTO['status'],
    isAnonymous: row.isAnonymous,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    author,
  };
}

export function toComplaintSummary(row: PrismaComplaintRow): ComplaintSummary {
  return {
    complaintId: row.complaint_id,
    title: row.title,
    category: row.category,
    status: row.status as ComplaintSummary['status'],
    isAnonymous: row.isAnonymous,
    createdAt: row.created_at,
  };
}

// -------------------------------------------------------------
// Submit Complaint
// -------------------------------------------------------------

export interface SubmitComplaintResult {
  success: true;
  complaint: ComplaintDTO;
}

export interface SubmitComplaintError {
  success: false;
  error: string;
}

export async function submitComplaint(
  user: SafeUser,
  input: CreateComplaintInput
): Promise<SubmitComplaintResult | SubmitComplaintError> {
  if (user.roleName !== 'USER') {
    return {
      success: false,
      error: 'Only employees can submit complaints',
    };
  }

  const userIdForDb = input.isAnonymous ? null : user.userId;

  const created = await repo.createComplaint({
    title: input.title,
    description: input.description,
    category: input.category?.trim() || null,
    isAnonymous: input.isAnonymous,
    user_id: userIdForDb,
  });

  return {
    success: true,
    complaint: toComplaintDTO(created),
  };
}

// -------------------------------------------------------------
// Get My Complaints
// -------------------------------------------------------------

export async function getMyComplaints(
  user: SafeUser
): Promise<ComplaintSummary[]> {
  const rows = await repo.listComplaintsByUser(user.userId);
  return rows.map(toComplaintSummary);
}

// -------------------------------------------------------------
// Get Single Complaint (with access control)
// -------------------------------------------------------------

export async function getComplaintForUser(
  user: SafeUser,
  complaintId: number
): Promise<ComplaintDTO | null> {
  const row = await repo.findComplaintById(complaintId);
  if (!row) return null;

  const isStaff: boolean =
    user.roleName === 'MANAGER' ||
    user.roleName === 'INVESTIGATOR' ||
    user.roleName === 'ADMIN';

  if (isStaff) {
    return toComplaintDTO(row);
  }

  if (row.user_id !== user.userId) {
    return null;
  }

  return toComplaintDTO(row);
}

// -------------------------------------------------------------
// Staff: List All Complaints
// -------------------------------------------------------------

export async function getAllComplaintsForStaff(
  user: SafeUser,
  filter?: { status?: ComplaintDTO['status'] }
): Promise<ComplaintSummary[]> {
  const allowed: RoleName[] = ['MANAGER', 'INVESTIGATOR', 'ADMIN'];
  if (!allowed.includes(user.roleName)) {
    throw new Error('Forbidden');
  }

  const rows = await repo.listAllComplaints(
    filter?.status ? { status: filter.status } : undefined
  );
  return rows.map(toComplaintSummary);
}

// -------------------------------------------------------------
// Dashboard stats (global)
// -------------------------------------------------------------

export async function getComplaintStats() {
  const byStatus = await repo.countComplaintsByStatus();
  const total = await repo.countAllComplaints();
  return { total, byStatus };
}

// -------------------------------------------------------------
// Per-user stats
// -------------------------------------------------------------

export interface UserComplaintStats {
  total: number;
  pending: number;
  underReview: number;
  approved: number;
  rejected: number;
  convertedToCase: number;
  recent: ComplaintSummary[];
}

export async function getUserComplaintStats(
  user: SafeUser
): Promise<UserComplaintStats> {
  const counts = await repo.countUserComplaintsByStatus(user.userId);
  const recentRows = await repo.getRecentUserComplaints(user.userId, 5);

  const total =
    (counts.PENDING ?? 0) +
    (counts.UNDER_REVIEW ?? 0) +
    (counts.APPROVED ?? 0) +
    (counts.REJECTED ?? 0) +
    (counts.CONVERTED_TO_CASE ?? 0);

  return {
    total,
    pending: counts.PENDING ?? 0,
    underReview: counts.UNDER_REVIEW ?? 0,
    approved: counts.APPROVED ?? 0,
    rejected: counts.REJECTED ?? 0,
    convertedToCase: counts.CONVERTED_TO_CASE ?? 0,
    recent: recentRows.map(toComplaintSummary),
  };
}

// -------------------------------------------------------------
// Delete Complaint
// -------------------------------------------------------------

/**
 * Check if user can delete a complaint:
 *  - USER: only own complaints, only status = PENDING
 *  - MANAGER: any PENDING or REJECTED complaint
 *  - ADMIN: any except CONVERTED_TO_CASE
 *  - INVESTIGATOR: never
 */
export async function canDeleteComplaint(
  user: SafeUser,
  complaintId: number
): Promise<boolean> {
  const row = await prisma.complaint.findUnique({
    where: { complaint_id: complaintId },
    select: { user_id: true, status: true },
  });

  if (!row) return false;

  // Never allow deleting a complaint that has a case
  if (row.status === 'CONVERTED_TO_CASE') return false;

  if (user.roleName === 'ADMIN') {
    return true;
  }

  if (user.roleName === 'MANAGER') {
    return row.status === 'PENDING' || row.status === 'REJECTED';
  }

  if (user.roleName === 'USER') {
    // Only own + only pending
    if (row.user_id !== user.userId) return false;
    return row.status === 'PENDING';
  }

  return false;
}

export async function deleteComplaint(
  user: SafeUser,
  complaintId: number
): Promise<{ success: true } | { success: false; error: string }> {
  const allowed = await canDeleteComplaint(user, complaintId);
  if (!allowed) {
    return { success: false, error: 'You cannot delete this complaint' };
  }

  // Block if a case exists (shouldn't happen given canDelete check, but be safe)
  const existingCase = await prisma.case.findUnique({
    where: { complaint_id: complaintId },
    select: { case_id: true },
  });
  if (existingCase) {
    return {
      success: false,
      error: 'Cannot delete a complaint that has a case',
    };
  }

  // Cascade deletes: additional info, complaint-linked evidence
  // (Prisma handles this via onDelete: Cascade on the relations)
  await prisma.complaint.delete({
    where: { complaint_id: complaintId },
  });

  return { success: true };
}