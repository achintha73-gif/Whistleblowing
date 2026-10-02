import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, UnauthorizedError } from '@/lib/auth';
import { markNotificationRead } from '@/features/notifications/services/notification.service';

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read.
 */
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const notificationId = Number(id);
    if (!Number.isInteger(notificationId) || notificationId <= 0) {
      return NextResponse.json(
        { error: 'Invalid notification ID' },
        { status: 400 }
      );
    }

    await markNotificationRead(user, notificationId);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    console.error('[PATCH /api/notifications/:id/read]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}