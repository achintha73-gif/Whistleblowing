import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, UnauthorizedError } from '@/lib/auth';
import { updateCaseStatusSchema } from '@/lib/validation';
import { updateCaseStatusForUser } from '@/features/cases/services/case.service';

/**
 * PATCH /api/cases/:id/status
 * Body: { status }
 * MANAGER or assigned INVESTIGATOR.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const caseId = Number(id);
    if (!Number.isInteger(caseId) || caseId <= 0) {
      return NextResponse.json({ error: 'Invalid case ID' }, { status: 400 });
    }

    const body = await request.json();
    const parsed = updateCaseStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await updateCaseStatusForUser(user, caseId, parsed.data.status);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    console.error('[PATCH /api/cases/:id/status]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}