import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validation';
import { login } from '@/features/auth/services/auth.service';
import { setSessionCookie } from '@/lib/auth';
import { checkRateLimit, rateLimitKey } from '@/lib/rate-limit';

/**
 * POST /api/auth/login
 * Body: { email, password }
 * On success: sets httpOnly session cookie and returns the user.
 *
 * Rate limit: 5 attempts per 15 minutes per IP.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const limit = checkRateLimit(rateLimitKey(request, 'login'), {
      max: 5,
      windowSeconds: 15 * 60,
    });

    if (!limit.success) {
      return NextResponse.json(
        {
          error: 'Too many login attempts. Please try again later.',
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

    const body = await request.json();

    // Validate input
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Call service
    const result = await login(parsed.data.email, parsed.data.password);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    // Set session cookie
    await setSessionCookie(result.token);

    // Return safe user (no password, no token in body)
    return NextResponse.json(
      { user: result.user },
      {
        status: 200,
        headers: {
          'X-RateLimit-Remaining': String(limit.remaining),
        },
      }
    );
  } catch (err) {
    console.error('[POST /api/auth/login]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}