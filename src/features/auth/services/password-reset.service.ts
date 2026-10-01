import { createHash, randomBytes } from 'crypto';
import {
  PASSWORD_RESET_EXPIRY_SECONDS,
  APP_URL,
} from '@/lib/auth-config';
import type {
  PasswordResetError,
  PasswordResetRequestResult,
  PasswordResetResult,
} from '../types';
import * as userRepo from '../repository/user.repository';
import * as resetRepo from '../repository/password-reset.repository';
import { hashPassword, verifyPassword } from './auth.service';
import { sendEmail } from './email.service';

// -------------------------------------------------------------
// Token helpers
// -------------------------------------------------------------

/**
 * Generate a cryptographically random token.
 * 32 bytes -> 64 hex chars. Unpredictable, safe to email.
 */
function generateRawToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Hash a token with SHA-256.
 * We only store this hash in DB, never the raw token.
 * If the DB leaks, the raw tokens cannot be reconstructed.
 */
function hashToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}

// -------------------------------------------------------------
// Request Password Reset
// -------------------------------------------------------------

export async function requestPasswordReset(
  email: string
): Promise<PasswordResetRequestResult> {
  // IMPORTANT: Same response whether or not the email exists.
  // This prevents attackers from discovering valid accounts.
  const GENERIC_MESSAGE =
    'If an account with that email exists, a reset link has been sent.';

  const user = await userRepo.findUserByEmail(email);

  // Silently succeed if user does not exist (enumeration protection)
  if (!user) {
    return { success: true, message: GENERIC_MESSAGE };
  }

  // Do not allow reset for suspended/inactive accounts
  if (user.status !== 'ACTIVE') {
    return { success: true, message: GENERIC_MESSAGE };
  }

  // Invalidate any previous reset tokens for this user
  await resetRepo.deleteTokensForUser(user.user_id);

  // Generate fresh token
  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(
    Date.now() + PASSWORD_RESET_EXPIRY_SECONDS * 1000
  );

  await resetRepo.createResetToken({
    user_id: user.user_id,
    tokenHash,
    expiresAt,
  });

  // Build reset link with RAW token in URL
  const resetUrl = `${APP_URL}/reset-password?token=${rawToken}`;
  const expiryMinutes = Math.round(PASSWORD_RESET_EXPIRY_SECONDS / 60);

  // Send email
  await sendEmail({
    to: user.email,
    subject: 'Reset your password - Whistleblowing System',
    text:
      `Hello ${user.name},\n\n` +
      `You requested a password reset.\n\n` +
      `Click this link to reset your password:\n${resetUrl}\n\n` +
      `This link expires in ${expiryMinutes} minutes.\n\n` +
      `If you did not request this, you can safely ignore this email.`,
    html: `
      <p>Hello <strong>${user.name}</strong>,</p>
      <p>You requested a password reset.</p>
      <p><a href="${resetUrl}">Click here to reset your password</a></p>
      <p>This link expires in <strong>${expiryMinutes} minutes</strong>.</p>
      <p>If you did not request this, you can safely ignore this email.</p>
    `,
  });

  return { success: true, message: GENERIC_MESSAGE };
}

// -------------------------------------------------------------
// Reset Password
// -------------------------------------------------------------

export async function resetPassword(
  rawToken: string,
  newPassword: string
): Promise<PasswordResetResult | PasswordResetError> {
  const tokenHash = hashToken(rawToken);

  const tokenRow = await resetRepo.findValidTokenByHash(tokenHash);

  if (!tokenRow) {
    return {
      success: false,
      error: 'This reset link is invalid or has expired.',
    };
  }

  // Do not allow reusing the same password (extra security touch)
  const isSameAsOld = await verifyPassword(
    newPassword,
    tokenRow.user.password
  );
  if (isSameAsOld) {
    return {
      success: false,
      error: 'New password must be different from your current password.',
    };
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password + mark token used + delete any other tokens for user
  // (best done in one transaction for atomicity)
  await updateUserPasswordAndConsumeToken(
    tokenRow.user_id,
    hashedPassword,
    tokenRow.id
  );

  return { success: true };
}

/**
 * Small helper to keep the transaction logic in one place.
 * Uses a Prisma transaction so partial updates never happen.
 */
async function updateUserPasswordAndConsumeToken(
  userId: number,
  hashedPassword: string,
  tokenId: number
): Promise<void> {
  const { prisma } = await import('@/lib/db');

  await prisma.$transaction([
    prisma.user.update({
      where: { user_id: userId },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { id: tokenId },
      data: { used_at: new Date() },
    }),
    // Clean up any other outstanding tokens for this user
    prisma.passwordResetToken.deleteMany({
      where: {
        user_id: userId,
        id: { not: tokenId },
        used_at: null,
      },
    }),
  ]);
}