import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth, UnauthorizedError } from '@/lib/auth';
import {
  setCaseInvestigatorsForUser,
  getCaseForUser,
} from '@/features/cases/services/case.service';
import { listCaseInvestigators } from '@/features/cases/repository/case.repository';

/**
 * GET /api/cases/:id/investigators
 * List all investigators assigned to a case.
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

    // Access check via service
    const caseDetail = await getCaseForUser(user, caseId);
    if (!caseDetail) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const investigators = await listCaseInvestigators(caseId);

    return NextResponse.json({ investigators }, { status: 200 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    console.error('[GET /api/cases/:id/investigators]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

// -------------------------------------------------------------
// PUT - replace all investigators on the case
// -------------------------------------------------------------

const putSchema = z.object({
  investigatorIds: z.array(z.number().int().positive()).max(20),
});

export async function PUT(
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
    const parsed = putSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await setCaseInvestigatorsForUser(
      user,
      caseId,
      parsed.data.investigatorIds
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      { success: true, added: result.added, removed: result.removed },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    console.error('[PUT /api/cases/:id/investigators]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}