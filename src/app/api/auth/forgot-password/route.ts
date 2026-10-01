import { NextRequest, NextResponse } from 'next/server';
import { forgotPasswordSchema } from '@/lib/validation';
import { requestPasswordReset } from '@/features/auth/services/password-reset.service';

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 *
 * Always returns the same generic response regardless of whether the
 * email exists - this is email enumeration protection.
 */
export async function POST(request: NextRequest) {
  try {
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
      { status: 200 }
    );
  } catch (err) {
    console.error('[POST /api/auth/forgot-password]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}