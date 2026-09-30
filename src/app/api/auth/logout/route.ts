import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

/**
 * POST /api/auth/logout
 * Clears the session cookie.
 */
export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('[POST /api/auth/logout]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
