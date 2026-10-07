import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validation';
import {
  register,
  signSessionToken,
} from '@/features/auth/services/auth.service';
import { AUTH_COOKIE_NAME } from '@/lib/auth-config';

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  // Parse + validate
  const parsed = registerSchema.safeParse({
    ...(body as Record<string, unknown>),
    // Force USER role - public self-registration only creates employees
    roleName: 'USER',
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Invalid input';
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  // Create account (does NOT sign in yet)
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
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}