import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, UnauthorizedError } from '@/lib/auth';
import { deleteEvidence } from '@/features/evidence/services/evidence.service';

/**
 * DELETE /api/evidence/:id
 * Delete an evidence item (rules enforced in service).
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const evidenceId = Number(id);
    if (!Number.isInteger(evidenceId) || evidenceId <= 0) {
      return NextResponse.json(
        { error: 'Invalid evidence ID' },
        { status: 400 }
      );
    }

    const result = await deleteEvidence(user, evidenceId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    console.error('[DELETE /api/evidence/:id]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}