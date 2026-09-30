import { cookies } from 'next/headers';
import {
  AUTH_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from './auth-config';
import { getUserFromToken } from '@/features/auth/services/auth.service';
import type { RoleName, SafeUser } from '@/features/auth/types';

// -------------------------------------------------------------
// Cookie management
// -------------------------------------------------------------

/**
 * Write the session cookie (httpOnly).
 * Called by the login API route after successful authentication.
 */
export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/**
 * Delete the session cookie.
 * Called by logout.
 */
export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

// -------------------------------------------------------------
// Session reader
// -------------------------------------------------------------

/**
 * Read the session cookie, verify the JWT, and load the fresh user.
 * Returns null if not logged in or token is invalid/expired.
 */
export async function getSession(): Promise<SafeUser | null> {
  const store = await cookies();
  const cookie = store.get(AUTH_COOKIE_NAME);
  if (!cookie?.value) return null;

  return getUserFromToken(cookie.value);
}

// -------------------------------------------------------------
// Guards (throw-based)
// -------------------------------------------------------------

export class UnauthorizedError extends Error {
  status = 401;
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  status = 403;
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Require a valid session. Throws UnauthorizedError if not.
 * Used in API routes and server components.
 */
export async function requireAuth(): Promise<SafeUser> {
  const session = await getSession();
  if (!session) {
    throw new UnauthorizedError();
  }
  return session;
}

/**
 * Require the user to have one of the given roles.
 * Throws ForbiddenError if the role does not match.
 *
 * Usage:
 *   const user = await requireRole('ADMIN');
 *   const user = await requireRole('ADMIN', 'MANAGER');
 */
export async function requireRole(
  ...allowedRoles: RoleName[]
): Promise<SafeUser> {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.roleName)) {
    throw new ForbiddenError(
      'You do not have permission to access this resource'
    );
  }
  return session;
}
