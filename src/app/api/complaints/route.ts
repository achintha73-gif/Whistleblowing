import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, UnauthorizedError } from '@/lib/auth';
import { createComplaintSchema } from '@/lib/validation';
import {
  submitComplaint,
  getMyComplaints,
  getAllComplaintsForStaff,
} from '@/features/complaints/services/complaint.service';
import type { ComplaintStatus } from '@/features/complaints/types';

/**
 * POST /api/complaints
 * Body: { title, description, category?, isAnonymous? }
 * Only USER role can submit.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const parsed = createComplaintSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await submitComplaint(user, {
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category ?? null,
      isAnonymous: parsed.data.isAnonymous ?? false,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { complaint: result.complaint },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    console.error('[POST /api/complaints]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/complaints
 * Query: ?status=PENDING (optional, staff only)
 * Returns complaints visible to the current user.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const url = new URL(request.url);
    const statusParam = url.searchParams.get('status');

    const isStaff =
      user.roleName === 'MANAGER' ||
      user.roleName === 'INVESTIGATOR' ||
      user.roleName === 'ADMIN';

    if (!isStaff) {
      // USER role: their own complaints only
      const complaints = await getMyComplaints(user);
      return NextResponse.json({ complaints }, { status: 200 });
    }

    const filter =
      statusParam && isValidStatus(statusParam)
        ? { status: statusParam }
        : undefined;

    const complaints = await getAllComplaintsForStaff(user, filter);
    return NextResponse.json({ complaints }, { status: 200 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    console.error('[GET /api/complaints]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

function isValidStatus(value: string): value is ComplaintStatus {
  return [
    'PENDING',
    'UNDER_REVIEW',
    'APPROVED',
    'REJECTED',
    'CONVERTED_TO_CASE',
  ].includes(value);
}