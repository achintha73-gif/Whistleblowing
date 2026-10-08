import type { SafeUser } from '@/features/auth/types';
import type {
  DepartmentDTO,
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from '../types';
import * as repo from '../repository/user-management.repository';
import { prisma } from '@/lib/db';

// -------------------------------------------------------------
// Prisma -> DTO
// -------------------------------------------------------------

type PrismaDepartmentRow = {
  department_id: number;
  department_name: string;
  description: string | null;
  status: string;
  manager_id: number | null;
  created_at: Date;
  manager: {
    user_id: number;
    name: string;
    email: string;
  } | null;
  _count: {
    users: number;
  };
};

export function toDepartmentDTO(row: PrismaDepartmentRow): DepartmentDTO {
  return {
    departmentId: row.department_id,
    departmentName: row.department_name,
    description: row.description,
    status: row.status,
    managerId: row.manager_id,
    managerName: row.manager?.name ?? null,
    managerEmail: row.manager?.email ?? null,
    userCount: row._count.users,
    createdAt: row.created_at,
  };
}

// -------------------------------------------------------------
// List (Admin only)
// -------------------------------------------------------------

export async function listDepartments(
  user: SafeUser
): Promise<DepartmentDTO[]> {
  if (user.roleName !== 'ADMIN') {
    throw new Error('Forbidden');
  }
  const rows = await repo.listAllDepartmentsForAdmin();
  return rows.map((r) => toDepartmentDTO(r as PrismaDepartmentRow));
}

// -------------------------------------------------------------
// Get one (Admin only)
// -------------------------------------------------------------

export async function getDepartmentById(
  user: SafeUser,
  departmentId: number
): Promise<DepartmentDTO | null> {
  if (user.roleName !== 'ADMIN') {
    throw new Error('Forbidden');
  }
  const row = await repo.findDepartmentById(departmentId);
  if (!row) return null;
  return toDepartmentDTO(row as PrismaDepartmentRow);
}

// -------------------------------------------------------------
// Create (Admin only)
// -------------------------------------------------------------

export interface DepartmentResult {
  success: true;
  department: DepartmentDTO;
}

export interface DepartmentError {
  success: false;
  error: string;
}

export async function createDepartment(
  user: SafeUser,
  input: CreateDepartmentInput
): Promise<DepartmentResult | DepartmentError> {
  if (user.roleName !== 'ADMIN') {
    return { success: false, error: 'Only admins can create departments' };
  }

  const name = input.departmentName.trim();
  if (name.length < 2 || name.length > 150) {
    return {
      success: false,
      error: 'Department name must be 2-150 characters',
    };
  }

  if (await repo.departmentNameExists(name)) {
    return { success: false, error: 'Department name already exists' };
  }

  // Validate manager if provided
  if (input.managerId) {
    const manager = await prisma.user.findUnique({
      where: { user_id: input.managerId },
      include: { role: true },
    });
    if (!manager) {
      return { success: false, error: 'Manager not found' };
    }
    if (
      manager.role.role_name !== 'MANAGER' &&
      manager.role.role_name !== 'ADMIN'
    ) {
      return {
        success: false,
        error: 'Manager must have MANAGER or ADMIN role',
      };
    }
  }

  try {
    const created = await repo.createDepartment({
      department_name: name,
      description: input.description?.trim() || null,
      manager_id: input.managerId ?? null,
      status: input.status ?? 'active',
    });
    return {
      success: true,
      department: toDepartmentDTO(created as PrismaDepartmentRow),
    };
  } catch (err) {
    console.error('[createDepartment]', err);
    return { success: false, error: 'Failed to create department' };
  }
}

// -------------------------------------------------------------
// Update (Admin only)
// -------------------------------------------------------------

export async function updateDepartment(
  user: SafeUser,
  departmentId: number,
  input: UpdateDepartmentInput
): Promise<DepartmentResult | DepartmentError> {
  if (user.roleName !== 'ADMIN') {
    return { success: false, error: 'Only admins can update departments' };
  }

  const existing = await repo.findDepartmentById(departmentId);
  if (!existing) {
    return { success: false, error: 'Department not found' };
  }

  // Validate name if changing
  if (input.departmentName !== undefined) {
    const name = input.departmentName.trim();
    if (name.length < 2 || name.length > 150) {
      return {
        success: false,
        error: 'Department name must be 2-150 characters',
      };
    }
    if (await repo.departmentNameExists(name, departmentId)) {
      return { success: false, error: 'Department name already exists' };
    }
  }

  // Validate manager if changing
  if (input.managerId !== undefined && input.managerId !== null) {
    const manager = await prisma.user.findUnique({
      where: { user_id: input.managerId },
      include: { role: true },
    });
    if (!manager) {
      return { success: false, error: 'Manager not found' };
    }
    if (
      manager.role.role_name !== 'MANAGER' &&
      manager.role.role_name !== 'ADMIN'
    ) {
      return {
        success: false,
        error: 'Manager must have MANAGER or ADMIN role',
      };
    }
  }

  try {
    const updated = await repo.updateDepartment(departmentId, {
      department_name: input.departmentName?.trim(),
      description:
        input.description !== undefined
          ? input.description?.trim() || null
          : undefined,
      manager_id: input.managerId,
      status: input.status,
    });
    return {
      success: true,
      department: toDepartmentDTO(updated as PrismaDepartmentRow),
    };
  } catch (err) {
    console.error('[updateDepartment]', err);
    return { success: false, error: 'Failed to update department' };
  }
}

// -------------------------------------------------------------
// Delete (Admin only)
// -------------------------------------------------------------

export interface DeleteResult {
  success: true;
}

export async function deleteDepartment(
  user: SafeUser,
  departmentId: number
): Promise<DeleteResult | DepartmentError> {
  if (user.roleName !== 'ADMIN') {
    return { success: false, error: 'Only admins can delete departments' };
  }

  const existing = await repo.findDepartmentById(departmentId);
  if (!existing) {
    return { success: false, error: 'Department not found' };
  }

  const userCount = await repo.countUsersInDepartment(departmentId);
  if (userCount > 0) {
    return {
      success: false,
      error: `Cannot delete: ${userCount} user(s) still assigned. Reassign them first.`,
    };
  }

  try {
    await repo.deleteDepartment(departmentId);
    return { success: true };
  } catch (err) {
    console.error('[deleteDepartment]', err);
    return { success: false, error: 'Failed to delete department' };
  }
}