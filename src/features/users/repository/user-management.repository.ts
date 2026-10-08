import { prisma } from '@/lib/db';

/**
 * User Management Repository - DB access ONLY.
 */

const USER_INCLUDE = {
  role: true,
  department: true,
} as const;

/**
 * List all users, optionally filtered by role or search term.
 * Ordered newest first.
 */
export async function listAllUsers(filter?: {
  roleName?: string;
  search?: string;
  status?: string;
}) {
  const where: Record<string, unknown> = {};

  if (filter?.roleName) {
    where.role = { role_name: filter.roleName };
  }

  if (filter?.status) {
    where.status = filter.status;
  }

  if (filter?.search) {
    where.OR = [
      { name: { contains: filter.search } },
      { email: { contains: filter.search } },
    ];
  }

  return prisma.user.findMany({
    where,
    orderBy: { created_at: 'desc' },
    include: USER_INCLUDE,
  });
}

/**
 * List the most recently created users (for admin dashboard).
 */
export async function listRecentUsers(limit = 5) {
  return prisma.user.findMany({
    take: limit,
    orderBy: { created_at: 'desc' },
    include: USER_INCLUDE,
  });
}

/**
 * Find a user by id (with role + department).
 */
export async function findUserById(userId: number) {
  return prisma.user.findUnique({
    where: { user_id: userId },
    include: USER_INCLUDE,
  });
}

/**
 * Update user status.
 */
export async function updateUserStatus(
  userId: number,
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
) {
  return prisma.user.update({
    where: { user_id: userId },
    data: { status },
  });
}

/**
 * Update user role.
 */
export async function updateUserRole(userId: number, roleId: number) {
  return prisma.user.update({
    where: { user_id: userId },
    data: { role_id: roleId },
  });
}

/**
 * Update user department (nullable - null removes assignment).
 */
export async function updateUserDepartment(
  userId: number,
  departmentId: number | null
) {
  return prisma.user.update({
    where: { user_id: userId },
    data: { department_id: departmentId },
  });
}

/**
 * List all roles (for admin dropdowns).
 */
export async function listAllRoles() {
  return prisma.role.findMany({
    orderBy: { role_id: 'asc' },
  });
}

/**
 * List all active departments (for admin dropdowns).
 */
export async function listAllDepartments() {
  return prisma.department.findMany({
    where: { status: 'active' },
    orderBy: { department_name: 'asc' },
    select: {
      department_id: true,
      department_name: true,
    },
  });
}

/**
 * Count users by status.
 */
export async function countUsersByStatus() {
  const rows = await prisma.user.groupBy({
    by: ['status'],
    _count: { _all: true },
  });

  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.status] = row._count._all;
  }
  return counts;
}

export async function countAllUsers(): Promise<number> {
  return prisma.user.count();
}

export async function countAllDepartments(): Promise<number> {
  return prisma.department.count();
}

// -------------------------------------------------------------
// Department CRUD (Admin)
// -------------------------------------------------------------

/**
 * List all departments with manager info + user count.
 */
export async function listAllDepartmentsForAdmin() {
  return prisma.department.findMany({
    orderBy: { department_name: 'asc' },
    include: {
      manager: {
        select: {
          user_id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: { users: true },
      },
    },
  });
}

/**
 * Find a department by id.
 */
export async function findDepartmentById(departmentId: number) {
  return prisma.department.findUnique({
    where: { department_id: departmentId },
    include: {
      manager: {
        select: { user_id: true, name: true, email: true },
      },
      _count: {
        select: { users: true },
      },
    },
  });
}

/**
 * Check if a department name already exists (optionally excluding an id).
 */
export async function departmentNameExists(
  name: string,
  excludeId?: number
) {
  const found = await prisma.department.findFirst({
    where: {
      department_name: name,
      ...(excludeId ? { NOT: { department_id: excludeId } } : {}),
    },
    select: { department_id: true },
  });
  return found !== null;
}

/**
 * Create a new department.
 */
export async function createDepartment(data: {
  department_name: string;
  description: string | null;
  manager_id: number | null;
  status: string;
}) {
  return prisma.department.create({
    data,
    include: {
      manager: {
        select: { user_id: true, name: true, email: true },
      },
      _count: {
        select: { users: true },
      },
    },
  });
}

/**
 * Update a department.
 */
export async function updateDepartment(
  departmentId: number,
  data: {
    department_name?: string;
    description?: string | null;
    manager_id?: number | null;
    status?: string;
  }
) {
  return prisma.department.update({
    where: { department_id: departmentId },
    data,
    include: {
      manager: {
        select: { user_id: true, name: true, email: true },
      },
      _count: {
        select: { users: true },
      },
    },
  });
}

/**
 * Delete a department.
 * NOTE: Users referencing it get department_id set to null (onDelete: SetNull).
 */
export async function deleteDepartment(departmentId: number) {
  return prisma.department.delete({
    where: { department_id: departmentId },
  });
}

/**
 * Count users in a department (for delete warning).
 */
export async function countUsersInDepartment(
  departmentId: number
): Promise<number> {
  return prisma.user.count({
    where: { department_id: departmentId },
  });
}