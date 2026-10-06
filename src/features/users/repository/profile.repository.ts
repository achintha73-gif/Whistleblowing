import { prisma } from '@/lib/db';

/**
 * Profile Repository - DB access for the current user's own profile.
 */

const PROFILE_INCLUDE = {
  role: true,
  department: true,
} as const;

/**
 * Get the current user's full profile.
 */
export async function findUserProfile(userId: number) {
  return prisma.user.findUnique({
    where: { user_id: userId },
    include: PROFILE_INCLUDE,
  });
}

/**
 * Update basic profile fields (name, phone).
 */
export async function updateProfile(
  userId: number,
  data: { name: string; phone: string | null }
) {
  return prisma.user.update({
    where: { user_id: userId },
    data: {
      name: data.name,
      phone: data.phone,
    },
    include: PROFILE_INCLUDE,
  });
}

/**
 * Update password (already hashed).
 */
export async function updatePassword(userId: number, hashedPassword: string) {
  return prisma.user.update({
    where: { user_id: userId },
    data: { password: hashedPassword },
  });
}