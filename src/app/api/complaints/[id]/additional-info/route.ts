import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, UnauthorizedError } from '@/lib/auth';
import { createAdditionalInfoSchema } from '@/lib/validation';
import {
  addAdditionalInfo,
  getAdditionalInfoForComplaint,
} from '@/features/complaints/services/additional-info.service';

/**
 * GET /api/complaints/:id/additional-info
 * Returns all additional info for a complaint.
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

    const additionalInfo = await getAdditionalInfoForComplaint(
      user,
      complaintId
    );
    return NextResponse.json({ additionalInfo }, { status: 200 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    console.error('[GET /api/complaints/:id/additional-info]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/complaints/:id/additional-info
 * Body: { title, description, informationType }
 */
export async function POST(
  request: NextRequest,
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

    const body = await request.json();
    const parsed = createAdditionalInfoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await addAdditionalInfo(user, {
      complaintId,
      title: parsed.data.title,
      description: parsed.data.description,
      informationType: parsed.data.informationType,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      { additionalInfo: result.additionalInfo },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    console.error('[POST /api/complaints/:id/additional-info]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}