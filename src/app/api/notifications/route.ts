import { NextResponse } from 'next/server';
import { requireAuth, UnauthorizedError } from '@/lib/auth';
import {
  getNotificationsForUser,
  getUnreadCount,
} from '@/features/notifications/services/notification.service';

/**
 * GET /api/notifications
 * Returns current user's notifications + unread count.
 */
export async function GET() {
  try {
    const user = await requireAuth();
    const notifications = await getNotificationsForUser(user);
    const unreadCount = await getUnreadCount(user);

    return NextResponse.json(
      { notifications, unreadCount },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    console.error('[GET /api/notifications]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}