import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { NotificationList } from '@/features/notifications/components/NotificationList';
import { getNotificationsForUser } from '@/features/notifications/services/notification.service';

export const metadata = {
  title: 'Notifications - Whistleblowing System',
};

export default async function NotificationsPage() {
  const user = await getSession();
  if (!user) redirect('/login');

  const notifications = await getNotificationsForUser(user);

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="mt-1 text-sm text-gray-600">
          {unread > 0
            ? `You have ${unread} unread notification${unread === 1 ? '' : 's'}.`
            : 'You are all caught up.'}
        </p>
      </div>

      <NotificationList initialNotifications={notifications} />
    </div>
  );
}