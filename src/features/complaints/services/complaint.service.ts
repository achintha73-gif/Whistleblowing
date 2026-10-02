import type { RoleName, SafeUser } from '@/features/auth/types';
import type {
  ComplaintDTO,
  ComplaintSummary,
  CreateComplaintInput,
} from '../types';
import * as repo from '../repository/complaint.repository';

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
// Submit Complaint (USER role)
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
// Per-user stats (Employee dashboard)
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