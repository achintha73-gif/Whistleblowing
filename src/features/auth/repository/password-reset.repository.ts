import { prisma } from '@/lib/db';

/**
 * Password Reset Repository - DB access ONLY.
 * No business logic here (no hashing, no email sending).
 */

/**
 * Insert a new password reset token.
 * The `tokenHash` MUST already be hashed (SHA-256) by the service layer.
 */
export async function createResetToken(data: {
  user_id: number;
  tokenHash: string;
  expiresAt: Date;
}) {
  return prisma.passwordResetToken.create({
    data: {
      user_id: data.user_id,
      token_hash: data.tokenHash,
      expires_at: data.expiresAt,
    },
  });
}

/**
 * Find a token by hash, only if:
 *   - it exists
 *   - it has not been used yet
 *   - it has not expired yet
 *
 * Returns the token row + the associated user (for the reset flow).
 */
export async function findValidTokenByHash(tokenHash: string) {
  return prisma.passwordResetToken.findFirst({
    where: {
      token_hash: tokenHash,
      used_at: null,
      expires_at: { gt: new Date() },
    },
    include: {
      user: true,
    },
  });
}

/**
 * Mark a token as used (one-time use enforcement).
 * Sets `used_at` to now.
 */
export async function markTokenUsed(tokenId: number) {
  return prisma.passwordResetToken.update({
    where: { id: tokenId },
    data: { used_at: new Date() },
  });
}

/**
 * Delete all tokens for a user.
 * Useful when:
 *   - user requests a new reset link (invalidate old ones)
 *   - cleanup after successful reset
 */
export async function deleteTokensForUser(userId: number) {
  return prisma.passwordResetToken.deleteMany({
    where: { user_id: userId },
  });
}

/**
 * Optional maintenance: delete all expired tokens (across all users).
 * Can be called manually or from a future cron/cleanup task.
 */
export async function deleteExpiredTokens() {
  return prisma.passwordResetToken.deleteMany({
    where: {
      expires_at: { lt: new Date() },
    },
  });
}