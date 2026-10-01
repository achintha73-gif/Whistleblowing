// -------------------------------------------------------------
// Complaint Feature - Type Definitions
// -------------------------------------------------------------

/**
 * Complaint status - must match ComplaintStatus enum in Prisma.
 */
export const COMPLAINT_STATUS = {
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CONVERTED_TO_CASE: 'CONVERTED_TO_CASE',
} as const;

export type ComplaintStatus =
  (typeof COMPLAINT_STATUS)[keyof typeof COMPLAINT_STATUS];

/**
 * Categories available for a complaint.
 * Stored as a plain string in the DB - this list is for UI dropdowns.
 */
export const COMPLAINT_CATEGORIES = [
  'Fraud',
  'Corruption',
  'Harassment',
  'Discrimination',
  'Safety',
  'Ethics',
  'Abuse of Power',
  'Other',
] as const;

export type ComplaintCategory = (typeof COMPLAINT_CATEGORIES)[number];

/**
 * Input for creating a new complaint.
 */
export interface CreateComplaintInput {
  title: string;
  description: string;
  category?: string | null;
  isAnonymous: boolean;
}

/**
 * A complaint as returned to the client.
 * The `user` field is only populated when the complaint is not anonymous.
 */
export interface ComplaintDTO {
  complaintId: number;
  title: string;
  description: string;
  category: string | null;
  status: ComplaintStatus;
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Author info (null when anonymous)
  author: {
    userId: number;
    name: string;
    email: string;
  } | null;
}

/**
 * Summary info (for list views) - lightweight.
 */
export interface ComplaintSummary {
  complaintId: number;
  title: string;
  category: string | null;
  status: ComplaintStatus;
  isAnonymous: boolean;
  createdAt: Date;
}