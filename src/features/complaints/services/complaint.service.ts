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

/**
 * Convert a Prisma complaint row into a safe DTO for the client.
 * Anonymous complaints hide the author even if `user` is present.
 */
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

/**
 * Submit a new complaint.
 * Only USER (Employee) role can submit.
 * If anonymous, the DB stores user_id = null.
 */
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

/**
 * Return the complaints submitted by this user.
 * Anonymous submissions are NOT returned here (they have no user_id).
 */
export async function getMyComplaints(
  user: SafeUser
): Promise<ComplaintSummary[]> {
  const rows = await repo.listComplaintsByUser(user.userId);
  return rows.map(toComplaintSummary);
}

// -------------------------------------------------------------
// Get Single Complaint (with access control)
// -------------------------------------------------------------

/**
 * Get a complaint by ID.
 * Access rules:
 *   - USER: can only see their OWN non-anonymous complaints
 *   - MANAGER / INVESTIGATOR / ADMIN: can see any complaint
 *
 * Anonymous complaints are visible to staff only (their own author cannot
 * be identified even if the original submitter comes back).
 */
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

  // Staff can view everything
  if (isStaff) {
    return toComplaintDTO(row);
  }

  // USER role: only see own, non-anonymous complaints
  if (row.user_id !== user.userId) {
    return null;
  }

  return toComplaintDTO(row);
}

// -------------------------------------------------------------
// Staff: List All Complaints
// -------------------------------------------------------------

/**
 * Managers / Investigators / Admins can list all complaints.
 * USER role is denied.
 */
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
// Dashboard stats
// -------------------------------------------------------------

export async function getComplaintStats() {
  const byStatus = await repo.countComplaintsByStatus();
  const total = await repo.countAllComplaints();
  return { total, byStatus };
}