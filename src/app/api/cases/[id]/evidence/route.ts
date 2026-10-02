import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, UnauthorizedError } from '@/lib/auth';
import { createEvidenceSchema } from '@/lib/validation';
import {
  addEvidence,
  getEvidenceForCase,
} from '@/features/evidence/services/evidence.service';

/**
 * GET /api/cases/:id/evidence
 * List evidence for a case.
 * Access: MANAGER, ADMIN, or assigned INVESTIGATOR.
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

    const evidence = await getEvidenceForCase(user, caseId);
    return NextResponse.json({ evidence }, { status: 200 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    console.error('[GET /api/cases/:id/evidence]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cases/:id/evidence
 * Body: { fileName, fileType, description? }
 * Only assigned INVESTIGATOR can add.
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
    const parsed = createEvidenceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await addEvidence(user, {
      caseId,
      fileName: parsed.data.fileName,
      fileType: parsed.data.fileType,
      description: parsed.data.description ?? null,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      { evidence: result.evidence },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    console.error('[POST /api/cases/:id/evidence]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}