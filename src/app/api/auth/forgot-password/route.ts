import { NextRequest, NextResponse } from 'next/server';
import { forgotPasswordSchema } from '@/lib/validation';
import { requestPasswordReset } from '@/features/auth/services/password-reset.service';
import { checkRateLimit, rateLimitKey } from '@/lib/rate-limit';

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 *
 * Always returns the same generic response regardless of whether the
 * email exists - this is email enumeration protection.
 *
 * Rate limit: 3 attempts per hour per IP.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const limit = checkRateLimit(rateLimitKey(request, 'forgot-password'), {
      max: 3,
      windowSeconds: 60 * 60,
    });

    if (!limit.success) {
      return NextResponse.json(
        {
          error: 'Too many password reset requests. Please try again later.',
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

    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await requestPasswordReset(parsed.data.email);

    return NextResponse.json(
      { message: result.message },
      {
        status: 200,
        headers: {
          'X-RateLimit-Remaining': String(limit.remaining),
        },
      }
    );
  } catch (err) {
    console.error('[POST /api/auth/forgot-password]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}