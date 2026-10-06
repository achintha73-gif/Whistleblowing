import { hashPassword, verifyPassword } from '@/features/auth/services/auth.service';
import type { SafeUser, RoleName, UserStatus } from '@/features/auth/types';
import * as profileRepo from '../repository/profile.repository';

// -------------------------------------------------------------
// Prisma -> DTO
// -------------------------------------------------------------

type PrismaProfileRow = {
  user_id: number;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  role_id: number;
  department_id: number | null;
  created_at: Date;
  role: {
    role_id: number;
    role_name: string;
  };
  department: {
    department_id: number;
    department_name: string;
  } | null;
};

export interface ProfileDTO {
  userId: number;
  name: string;
  email: string;
  phone: string | null;
  status: UserStatus;
  roleName: RoleName;
  departmentId: number | null;
  departmentName: string | null;
  createdAt: Date;
}

export function toProfileDTO(row: PrismaProfileRow): ProfileDTO {
  return {
    userId: row.user_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    status: row.status as UserStatus,
    roleName: row.role.role_name as RoleName,
    departmentId: row.department_id,
    departmentName: row.department?.department_name ?? null,
    createdAt: row.created_at,
  };
}

// -------------------------------------------------------------
// Get Profile
// -------------------------------------------------------------

export async function getProfile(user: SafeUser): Promise<ProfileDTO | null> {
  const row = await profileRepo.findUserProfile(user.userId);
  if (!row) return null;
  return toProfileDTO(row as PrismaProfileRow);
}

// -------------------------------------------------------------
// Update Profile (name + phone)
// -------------------------------------------------------------

export interface UpdateProfileResult {
  success: true;
  profile: ProfileDTO;
}

export interface UpdateProfileError {
  success: false;
  error: string;
}

export async function updateProfile(
  user: SafeUser,
  input: { name: string; phone: string | null }
): Promise<UpdateProfileResult | UpdateProfileError> {
  const name = input.name.trim();
  const phone = input.phone?.trim() || null;

  if (name.length < 2) {
    return { success: false, error: 'Name is too short' };
  }
  if (name.length > 150) {
    return { success: false, error: 'Name is too long' };
  }
  if (phone && (phone.length < 7 || phone.length > 20)) {
    return { success: false, error: 'Phone number must be 7-20 characters' };
  }

  const updated = await profileRepo.updateProfile(user.userId, {
    name,
    phone,
  });

  return {
    success: true,
    profile: toProfileDTO(updated as PrismaProfileRow),
  };
}

// -------------------------------------------------------------
// Change Password
// -------------------------------------------------------------

export interface ChangePasswordResult {
  success: true;
}

export interface ChangePasswordError {
  success: false;
  error: string;
}

export async function changePassword(
  user: SafeUser,
  currentPassword: string,
  newPassword: string
): Promise<ChangePasswordResult | ChangePasswordError> {
  // Get the current password hash
  const row = await profileRepo.findUserProfile(user.userId);
  if (!row) {
    return { success: false, error: 'User not found' };
  }

  // Verify current password
  const currentOk = await verifyPassword(currentPassword, row.password);
  if (!currentOk) {
    return { success: false, error: 'Current password is incorrect' };
  }

  // Prevent same password
  const sameAsOld = await verifyPassword(newPassword, row.password);
  if (sameAsOld) {
    return {
      success: false,
      error: 'New password must be different from current password',
    };
  }

  // Hash + save
  const hashed = await hashPassword(newPassword);
  await profileRepo.updatePassword(user.userId, hashed);

  return { success: true };
}