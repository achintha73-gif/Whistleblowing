import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { deleteComplaintEvidence } from '@/features/complaints/services/complaint-evidence.service';

interface RouteParams {
  params: Promise<{ id: string; evidenceId: string }>;
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { evidenceId } = await params;
    const id = Number(evidenceId);
    if (!Number.isFinite(id)) {
      return NextResponse.json(
        { error: 'Invalid evidence ID' },
        { status: 400 }
      );
    }

    const result = await deleteComplaintEvidence(
      id,
      user.userId,
      user.roleName
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Complaint Evidence DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
