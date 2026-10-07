import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validation';
import {
  register,
  signSessionToken,
} from '@/features/auth/services/auth.service';
import { AUTH_COOKIE_NAME } from '@/lib/auth-config';
import { checkRateLimit, rateLimitKey } from '@/lib/rate-limit';

/**
 * POST /api/auth/register
 * Body: { name, email, password, phone? }
 * On success: creates USER account, sets session cookie, returns user.
 *
 * Rate limit: 3 attempts per hour per IP.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const limit = checkRateLimit(rateLimitKey(request, 'register'), {
      max: 3,
      windowSeconds: 60 * 60,
    });

    if (!limit.success) {
      return NextResponse.json(
        {
          error: 'Too many registration attempts. Please try again later.',
          retryAfter: limit.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(limit.retryAfter),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Parse + validate (force USER role)
    const parsed = registerSchema.safeParse({
      ...(body as Record<string, unknown>),
      roleName: 'USER',
    });

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Invalid input';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    // Create account
    const result = await register(parsed.data);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Auto-login: sign JWT and set cookie
    const token = await signSessionToken({
      userId: result.user.userId,
      email: result.user.email,
      roleName: result.user.roleName,
      name: result.user.name,
    });

    const response = NextResponse.json({
      success: true,
      user: result.user,
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    console.error('[POST /api/auth/register]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}