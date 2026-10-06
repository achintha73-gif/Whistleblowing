import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { Bell } from 'lucide-react';
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
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
            <Bell className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Notifications
            </h1>
            <p className="mt-0.5 text-sm text-gray-600">
              {unread > 0
                ? `You have ${unread} unread notification${unread === 1 ? '' : 's'}.`
                : 'You are all caught up.'}
            </p>
          </div>
        </div>

        {unread > 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-white/60 bg-white/60 px-3.5 py-2 shadow-lg shadow-blue-900/5 backdrop-blur-xl">
            <span className="flex h-2 w-2 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600" />
            <span className="text-sm font-semibold text-gray-900">
              {unread} unread
            </span>
          </div>
        )}
      </div>

      <NotificationList initialNotifications={notifications} />
    </div>
  );
}