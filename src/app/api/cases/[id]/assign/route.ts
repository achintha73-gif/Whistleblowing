import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, UnauthorizedError } from '@/lib/auth';
import { assignInvestigatorSchema } from '@/lib/validation';
import { assignInvestigatorToCase } from '@/features/cases/services/case.service';

/**
 * POST /api/cases/:id/assign
 * Body: { investigatorId }
 * MANAGER only.
 */
export async function POST(
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
    const parsed = assignInvestigatorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await assignInvestigatorToCase(
      user,
      caseId,
      parsed.data.investigatorId
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    console.error('[POST /api/cases/:id/assign]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}