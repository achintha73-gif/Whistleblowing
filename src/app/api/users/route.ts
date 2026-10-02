import { NextRequest, NextResponse } from 'next/server';
import { requireRole, UnauthorizedError, ForbiddenError } from '@/lib/auth';
import { listUsers } from '@/features/users/services/user-management.service';

/**
 * GET /api/users
 * Query: ?roleName=USER&status=ACTIVE&search=john
 * ADMIN only.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireRole('ADMIN');
    const url = new URL(request.url);

    const filter = {
      roleName: url.searchParams.get('roleName') || undefined,
      status: url.searchParams.get('status') || undefined,
      search: url.searchParams.get('search') || undefined,
    };

    const users = await listUsers(user, filter);
    return NextResponse.json({ users }, { status: 200 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('[GET /api/users]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}