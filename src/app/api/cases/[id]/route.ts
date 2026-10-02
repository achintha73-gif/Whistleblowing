import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, UnauthorizedError } from '@/lib/auth';
import { getCaseForUser, getCaseHistory } from '@/features/cases/services/case.service';

/**
 * GET /api/cases/:id
 * Returns case detail + status history. Access-controlled.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const caseId = Number(id);
    if (!Number.isInteger(caseId) || caseId <= 0) {
      return NextResponse.json({ error: 'Invalid case ID' }, { status: 400 });
    }

    const caseDetail = await getCaseForUser(user, caseId);
    if (!caseDetail) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const history = await getCaseHistory(caseId);

    return NextResponse.json({ caseDetail, history }, { status: 200 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    console.error('[GET /api/cases/:id]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}