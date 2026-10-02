import { z } from 'zod';

// -------------------------------------------------------------
// Auth Validation Schemas
// -------------------------------------------------------------

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .trim(),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  phone: z
    .string()
    .min(7, 'Phone number is too short')
    .max(20, 'Phone number is too long')
    .optional()
    .or(z.literal('')),
  roleName: z.enum(['USER', 'MANAGER', 'INVESTIGATOR', 'ADMIN']),
  departmentId: z
    .number()
    .int()
    .positive()
    .optional(),
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;

// -------------------------------------------------------------
// Password Reset Validation Schemas
// -------------------------------------------------------------

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
});

export const resetPasswordSchema = z.object({
  token: z
    .string()
    .min(1, 'Token is required')
    .regex(/^[a-f0-9]{64}$/, 'Invalid token format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

// -------------------------------------------------------------
// Complaint Validation Schemas
// -------------------------------------------------------------

export const createComplaintSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title is too long')
    .trim(),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description is too long')
    .trim(),
  category: z
    .string()
    .max(100, 'Category is too long')
    .trim()
    .optional()
    .or(z.literal('')),
  isAnonymous: z.boolean().default(false),
});

export type CreateComplaintSchema = z.infer<typeof createComplaintSchema>;

// -------------------------------------------------------------
// Case Validation Schemas
// -------------------------------------------------------------

const CASE_PRIORITY_VALUES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
const CASE_STATUS_VALUES = [
  'OPEN',
  'INVESTIGATING',
  'PENDING_REVIEW',
  'CLOSED',
  'ARCHIVED',
] as const;

export const createCaseSchema = z.object({
  complaintId: z
    .number()
    .int()
    .positive('Complaint ID must be positive'),
  priority: z.enum(CASE_PRIORITY_VALUES).optional(),
});

export const assignInvestigatorSchema = z.object({
  investigatorId: z
    .number()
    .int()
    .positive('Investigator ID must be positive'),
});

export const updateCaseStatusSchema = z.object({
  status: z.enum(CASE_STATUS_VALUES),
});

export type CreateCaseSchema = z.infer<typeof createCaseSchema>;
export type AssignInvestigatorSchema = z.infer<typeof assignInvestigatorSchema>;
export type UpdateCaseStatusSchema = z.infer<typeof updateCaseStatusSchema>;

// -------------------------------------------------------------
// Evidence Validation Schemas
// -------------------------------------------------------------

export const createEvidenceSchema = z.object({
  fileName: z
    .string()
    .min(1, 'File name is required')
    .max(255, 'File name is too long')
    .trim(),
  fileType: z
    .string()
    .min(1, 'File type is required')
    .max(50, 'File type is too long')
    .trim(),
  description: z
    .string()
    .max(2000, 'Description is too long')
    .trim()
    .optional()
    .or(z.literal('')),
});

export type CreateEvidenceSchema = z.infer<typeof createEvidenceSchema>;
// -------------------------------------------------------------
// Investigation Report Validation Schemas
// -------------------------------------------------------------

export const upsertReportSchema = z.object({
  findings: z
    .string()
    .min(20, 'Findings must be at least 20 characters')
    .max(10000, 'Findings are too long')
    .trim(),
  recommendation: z
    .string()
    .min(10, 'Recommendation must be at least 10 characters')
    .max(5000, 'Recommendation is too long')
    .trim(),
});

export type UpsertReportSchema = z.infer<typeof upsertReportSchema>;

// -------------------------------------------------------------
// Notification Validation Schemas
// -------------------------------------------------------------

export const markNotificationReadSchema = z.object({
  notificationId: z
    .number()
    .int()
    .positive('Notification ID must be positive'),
});

export type MarkNotificationReadSchema = z.infer<typeof markNotificationReadSchema>;
