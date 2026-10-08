// -------------------------------------------------------------
// Users Feature - Type Definitions
// -------------------------------------------------------------

import type { RoleName, UserStatus } from '@/features/auth/types';

export interface UserListItem {
  userId: number;
  name: string;
  email: string;
  phone: string | null;
  status: UserStatus;
  roleId: number;
  roleName: RoleName;
  departmentId: number | null;
  departmentName: string | null;
  createdAt: Date;
}

export type UserDetail = UserListItem;

export interface UpdateUserStatusInput {
  userId: number;
  status: UserStatus;
}

export interface UpdateUserRoleInput {
  userId: number;
  roleId: number;
}

// -------------------------------------------------------------
// Department Types
// -------------------------------------------------------------

export interface DepartmentDTO {
  departmentId: number;
  departmentName: string;
  description: string | null;
  status: string;
  managerId: number | null;
  managerName: string | null;
  managerEmail: string | null;
  userCount: number;
  createdAt: Date;
}

export interface CreateDepartmentInput {
  departmentName: string;
  description?: string | null;
  managerId?: number | null;
  status?: string;
}

export interface UpdateDepartmentInput {
  departmentName?: string;
  description?: string | null;
  managerId?: number | null;
  status?: string;
}