import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  uploadComplaintEvidence,
  listComplaintEvidence,
} from '@/features/complaints/services/complaint-evidence.service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: List all evidence for a complaint
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const complaintId = Number(id);
    if (!Number.isFinite(complaintId)) {
      return NextResponse.json(
        { error: 'Invalid complaint ID' },
        { status: 400 }
      );
    }

    const evidence = await listComplaintEvidence(complaintId);
    return NextResponse.json({ evidence });
  } catch (error) {
    console.error('[Complaint Evidence GET] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Upload a new evidence file
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const complaintId = Number(id);
    if (!Number.isFinite(complaintId)) {
      return NextResponse.json(
        { error: 'Invalid complaint ID' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const description = (formData.get('description') as string | null) || '';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const result = await uploadComplaintEvidence(
      complaintId,
      user.userId,
      file,
      description
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      { success: true, evidence: result.evidence },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Complaint Evidence POST] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
