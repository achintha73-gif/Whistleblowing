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
 * List all roles (for admin dropdowns).
 */
export async function listAllRoles() {
  return prisma.role.findMany({
    orderBy: { role_id: 'asc' },
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