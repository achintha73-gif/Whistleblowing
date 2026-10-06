import type { SafeUser } from '@/features/auth/types';
import type { RoleName, UserStatus } from '@/features/auth/types';
import type { UserListItem, UserDetail } from '../types';
import * as userRepo from '../repository/user-management.repository';

// -------------------------------------------------------------
// Prisma -> DTO
// -------------------------------------------------------------

type PrismaUserRow = {
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

export function toUserListItem(row: PrismaUserRow): UserListItem {
  return {
    userId: row.user_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    status: row.status as UserStatus,
    roleId: row.role_id,
    roleName: row.role.role_name as RoleName,
    departmentId: row.department_id,
    departmentName: row.department?.department_name ?? null,
    createdAt: row.created_at,
  };
}

// -------------------------------------------------------------
// List Users (Admin only)
// -------------------------------------------------------------

export async function listUsers(
  user: SafeUser,
  filter?: { roleName?: string; status?: string; search?: string }
): Promise<UserListItem[]> {
  if (user.roleName !== 'ADMIN') {
    throw new Error('Forbidden');
  }

  const rows = await userRepo.listAllUsers(filter);
  return rows.map((r) => toUserListItem(r as PrismaUserRow));
}

// -------------------------------------------------------------
// Get One User (Admin only)
// -------------------------------------------------------------

export async function getUserById(
  user: SafeUser,
  userId: number
): Promise<UserDetail | null> {
  if (user.roleName !== 'ADMIN') return null;

  const row = await userRepo.findUserById(userId);
  if (!row) return null;

  return toUserListItem(row as PrismaUserRow);
}

// -------------------------------------------------------------
// Update Status (Admin only)
// -------------------------------------------------------------

export interface UpdateResult {
  success: true;
}

export interface UpdateError {
  success: false;
  error: string;
}

export async function updateUserStatus(
  user: SafeUser,
  targetUserId: number,
  status: UserStatus
): Promise<UpdateResult | UpdateError> {
  if (user.roleName !== 'ADMIN') {
    return { success: false, error: 'Only admins can change user status' };
  }

  if (user.userId === targetUserId) {
    return { success: false, error: 'You cannot change your own status' };
  }

  const target = await userRepo.findUserById(targetUserId);
  if (!target) {
    return { success: false, error: 'User not found' };
  }

  await userRepo.updateUserStatus(targetUserId, status);
  return { success: true };
}

// -------------------------------------------------------------
// Update Role (Admin only)
// -------------------------------------------------------------

export async function updateUserRole(
  user: SafeUser,
  targetUserId: number,
  roleId: number
): Promise<UpdateResult | UpdateError> {
  if (user.roleName !== 'ADMIN') {
    return { success: false, error: 'Only admins can change user roles' };
  }

  if (user.userId === targetUserId) {
    return { success: false, error: 'You cannot change your own role' };
  }

  const target = await userRepo.findUserById(targetUserId);
  if (!target) {
    return { success: false, error: 'User not found' };
  }

  const allRoles = await userRepo.listAllRoles();
  const roleExists = allRoles.some((r) => r.role_id === roleId);
  if (!roleExists) {
    return { success: false, error: 'Invalid role' };
  }

  await userRepo.updateUserRole(targetUserId, roleId);
  return { success: true };
}

// -------------------------------------------------------------
// List Roles (for dropdowns)
// -------------------------------------------------------------

export async function listRoles(user: SafeUser) {
  if (user.roleName !== 'ADMIN') {
    throw new Error('Forbidden');
  }
  return userRepo.listAllRoles();
}

// -------------------------------------------------------------
// Admin Dashboard Stats
// -------------------------------------------------------------

export interface AdminRecentUser {
  userId: number;
  name: string;
  email: string;
  status: UserStatus;
  roleName: RoleName;
  departmentName: string | null;
  createdAt: Date;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalDepartments: number;
  recentUsers: AdminRecentUser[];
}

export async function getAdminStats(): Promise<AdminStats> {
  const [byStatus, totalUsers, totalDepartments, recentRows] =
    await Promise.all([
      userRepo.countUsersByStatus(),
      userRepo.countAllUsers(),
      userRepo.countAllDepartments(),
      userRepo.listRecentUsers(5),
    ]);

  const recentUsers: AdminRecentUser[] = recentRows.map((r) => ({
    userId: r.user_id,
    name: r.name,
    email: r.email,
    status: r.status as UserStatus,
    roleName: r.role.role_name as RoleName,
    departmentName: r.department?.department_name ?? null,
    createdAt: r.created_at,
  }));

  return {
    totalUsers,
    activeUsers: byStatus.ACTIVE ?? 0,
    suspendedUsers: (byStatus.SUSPENDED ?? 0) + (byStatus.INACTIVE ?? 0),
    totalDepartments,
    recentUsers,
  };
}