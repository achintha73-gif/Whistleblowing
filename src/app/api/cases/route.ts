import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, UnauthorizedError } from '@/lib/auth';
import { createCaseSchema } from '@/lib/validation';
import {
  createCaseFromComplaint,
  listCasesForUser,
} from '@/features/cases/services/case.service';
import type { CaseStatus } from '@/features/cases/types';

/**
 * GET /api/cases
 * Query: ?status=OPEN (optional)
 * Role-aware:
 *   - MANAGER / ADMIN: all cases
 *   - INVESTIGATOR: only assigned cases
 *   - USER: forbidden
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const url = new URL(request.url);
    const statusParam = url.searchParams.get('status');

    const filter =
      statusParam && isValidStatus(statusParam)
        ? { status: statusParam }
        : undefined;

    const cases = await listCasesForUser(user, filter);
    return NextResponse.json({ cases }, { status: 200 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (err instanceof Error && err.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('[GET /api/cases]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cases
 * Body: { complaintId, priority? }
 * MANAGER only.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const parsed = createCaseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await createCaseFromComplaint(
      user,
      parsed.data.complaintId,
      parsed.data.priority
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      { caseDetail: result.caseDetail },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    console.error('[POST /api/cases]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

function isValidStatus(value: string): value is CaseStatus {
  return ['OPEN', 'INVESTIGATING', 'PENDING_REVIEW', 'CLOSED', 'ARCHIVED'].includes(
    value
  );
}