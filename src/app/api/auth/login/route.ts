import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validation';
import { login } from '@/features/auth/services/auth.service';
import { setSessionCookie } from '@/lib/auth';

/**
 * POST /api/auth/login
 * Body: { email, password }
 * On success: sets httpOnly session cookie and returns the user.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Validate input
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // 2. Call service
    const result = await login(parsed.data.email, parsed.data.password);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    // 3. Set session cookie
    await setSessionCookie(result.token);

    // 4. Return safe user (no password, no token in body)
    return NextResponse.json(
      { user: result.user },
      { status: 200 }
    );
  } catch (err) {
    console.error('[POST /api/auth/login]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
