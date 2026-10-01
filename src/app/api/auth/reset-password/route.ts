import { NextRequest, NextResponse } from 'next/server';
import { resetPasswordSchema } from '@/lib/validation';
import { resetPassword } from '@/features/auth/services/password-reset.service';

/**
 * POST /api/auth/reset-password
 * Body: { token, password }
 *
 * The token comes from the URL of the reset link.
 * On success, the user's password is updated and the token is invalidated.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await resetPassword(
      parsed.data.token,
      parsed.data.password
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    );
  } catch (err) {
    console.error('[POST /api/auth/reset-password]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}