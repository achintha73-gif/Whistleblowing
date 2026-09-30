import { prisma } from '@/lib/db';
import type { RoleName } from '../types';

/**
 * Auth Repository - User queries ONLY.
 * No business logic here. No hashing. No JWT.
 * Just database access.
 */

/**
 * Find a user by email, including their role.
 * Used during login to fetch the user + verify password.
 */
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      role: true,
      department: true,
    },
  });
}

/**
 * Find a user by id, including their role.
 * Used to hydrate the session from a JWT.
 */
export async function findUserById(user_id: number) {
  return prisma.user.findUnique({
    where: { user_id },
    include: {
      role: true,
      department: true,
    },
  });
}

/**
 * Create a new user.
 * The password passed in MUST already be hashed.
 */
export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  role_id: number;
  department_id?: number | null;
}) {
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone ?? null,
      role_id: data.role_id,
      department_id: data.department_id ?? null,
    },
    include: {
      role: true,
    },
  });
}

/**
 * Check if an email is already registered.
 */
export async function emailExists(email: string): Promise<boolean> {
  const count = await prisma.user.count({ where: { email } });
  return count > 0;
}
