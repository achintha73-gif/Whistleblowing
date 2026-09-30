import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { JWT_SECRET, AUTH_COOKIE_NAME } from '@/lib/auth-config';

/**
 * Middleware - runs before every matching request.
 *
 * Responsibilities:
 *   1. Block unauthenticated access to /dashboard/*
 *   2. Redirect authenticated users away from /login
 *   3. Light JWT verification (signature + expiry only)
 *
 * NOTE: This does NOT check the DB (Edge runtime has no Prisma).
 * The page itself will call getSession() to do a fresh DB check.
 */

// Routes that require a valid session
const PROTECTED_PREFIXES = ['/dashboard'];

// Routes that logged-in users should NOT see (redirect them away)
const AUTH_ONLY_ROUTES = ['/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = token ? await verifyToken(token) : false;
  console.log('[MIDDLEWARE] path:', pathname, '| token exists:', !!token, '| auth:', isAuthenticated);

  // ---------------------------------------------------------
  // 1. Logged-in user tries to visit /login -> send to dashboard
  // ---------------------------------------------------------
  if (AUTH_ONLY_ROUTES.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ---------------------------------------------------------
  // 2. Unauthenticated user tries protected route -> send to login
  // ---------------------------------------------------------
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

/**
 * Minimal JWT verification - signature + expiry only.
 * Does NOT hit the database.
 */
async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET),
      { algorithms: ['HS256'] }
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Which routes this middleware runs on.
 * - Skip static files, images, Next.js internals, API (API does its own checks)
 */
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};