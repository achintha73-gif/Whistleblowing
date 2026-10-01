// -------------------------------------------------------------
// Auth Feature - Type Definitions
// -------------------------------------------------------------

/**
 * Roles available in the system.
 * These MUST match the RoleName enum in prisma/schema.prisma
 */
export const ROLES = {
  USER: 'USER',
  MANAGER: 'MANAGER',
  INVESTIGATOR: 'INVESTIGATOR',
  ADMIN: 'ADMIN',
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

/**
 * User status - matches UserStatus enum in Prisma
 */
export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

/**
 * Safe user object - what we return to the client.
 * NEVER includes the password hash.
 */
export interface SafeUser {
  userId: number;
  name: string;
  email: string;
  phone: string | null;
  status: UserStatus;
  roleId: number;
  roleName: RoleName;
  departmentId: number | null;
  createdAt: Date;
}

/**
 * Session payload - what we store inside the JWT.
 * Keep this minimal - it is sent on every request.
 */
export interface SessionPayload {
  userId: number;
  email: string;
  roleName: RoleName;
  name: string;
}

/**
 * Input for login.
 */
export interface LoginInput {
  email: string;
  password: string;
}

/**
 * Input for registration (self-signup).
 * Admin-created users go through the users feature later.
 */
export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  roleName: RoleName;
  departmentId?: number;
}

// -------------------------------------------------------------
// Password Reset
// -------------------------------------------------------------

export interface PasswordResetRequestResult {
  success: true;
  // For security: same message whether or not the email exists
  message: string;
}

export interface PasswordResetResult {
  success: true;
}

export interface PasswordResetError {
  success: false;
  error: string;
}
