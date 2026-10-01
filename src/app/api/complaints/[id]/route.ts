import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, UnauthorizedError } from '@/lib/auth';
import { getComplaintForUser } from '@/features/complaints/services/complaint.service';

/**
 * GET /api/complaints/:id
 * Returns a single complaint, with access control enforced by the service.
 * Returns 404 whether the complaint doesn't exist OR the user cannot see it.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const complaintId = Number(id);
    if (!Number.isInteger(complaintId) || complaintId <= 0) {
      return NextResponse.json(
        { error: 'Invalid complaint ID' },
        { status: 400 }
      );
    }

    const complaint = await getComplaintForUser(user, complaintId);

    if (!complaint) {
      // Same response whether not-found or not-allowed (avoid info leak)
      return NextResponse.json(
        { error: 'Complaint not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ complaint }, { status: 200 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    console.error('[GET /api/complaints/:id]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}