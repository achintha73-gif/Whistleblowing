import { prisma } from '@/lib/db';
import type { RoleName } from '../types';

/**
 * Auth Repository - Role queries ONLY.
 */

/**
 * Find a role by its name enum.
 * Used during registration to map "USER" -> role_id.
 */
export async function findRoleByName(roleName: RoleName) {
  return prisma.role.findUnique({
    where: { role_name: roleName },
  });
}

/**
 * List all roles.
 * Useful for admin dropdowns later.
 */
export async function listRoles() {
  return prisma.role.findMany({
    orderBy: { role_id: 'asc' },
  });
}
