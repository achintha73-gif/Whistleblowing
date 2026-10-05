import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { JWT_SECRET, AUTH_COOKIE_NAME } from '@/lib/auth-config';

/**
 * Middleware - runs before every matching request.
 *
 * Responsibilities:
 *   1. Allow public routes (anonymous submission + tracking) without auth
 *   2. Block unauthenticated access to /dashboard/*
 *   3. Redirect authenticated users away from /login
 *   4. Light JWT verification (signature + expiry only)
 */

// Routes that require a valid session
const PROTECTED_PREFIXES = ['/dashboard'];

// Routes that logged-in users should NOT see (redirect them away)
const AUTH_ONLY_ROUTES = ['/login'];

// Public routes that do NOT require authentication
const PUBLIC_ROUTES = [
  '/report',
  '/track',
  '/anonymous',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = token ? await verifyToken(token) : false;

  // ---------------------------------------------------------
  // 1. Public routes - always allow (no auth required)
  // ---------------------------------------------------------
  const isPublic = PUBLIC_ROUTES.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isPublic) {
    return NextResponse.next();
  }

  // ---------------------------------------------------------
  // 2. Logged-in user tries to visit /login -> send to dashboard
  // ---------------------------------------------------------
  if (AUTH_ONLY_ROUTES.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ---------------------------------------------------------
  // 3. Unauthenticated user tries protected route -> send to login
  // ---------------------------------------------------------
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`)
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

export const config = {
  matcher: [
    // Skip API, Next.js internals, static files
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};