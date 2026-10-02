import { NextResponse } from 'next/server';
import { requireRole, UnauthorizedError, ForbiddenError } from '@/lib/auth';
import { listAvailableInvestigators } from '@/features/cases/services/case.service';

/**
 * GET /api/investigators
 * Returns list of active investigators.
 * MANAGER or ADMIN only.
 */
export async function GET() {
  try {
    await requireRole('MANAGER', 'ADMIN');
    const investigators = await listAvailableInvestigators();
    return NextResponse.json({ investigators }, { status: 200 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('[GET /api/investigators]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}