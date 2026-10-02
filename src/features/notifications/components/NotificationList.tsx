'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check } from 'lucide-react';
import type { NotificationDTO } from '../types';

export function NotificationList({
  initialNotifications,
}: {
  initialNotifications: NotificationDTO[];
}) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [markingId, setMarkingId] = useState<number | null>(null);

  async function markRead(id: number) {
    setMarkingId(id);
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
      });
      if (!res.ok) throw new Error('Failed');

      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === id ? { ...n, isRead: true } : n
        )
      );
      router.refresh();
    } catch {
      // silent
    } finally {
      setMarkingId(null);
    }
  }

  if (notifications.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
        <Bell className="mx-auto h-10 w-10 text-gray-300 mb-3" />
        <p className="text-sm font-medium text-gray-600">No notifications</p>
        <p className="mt-1 text-xs text-gray-500">
          You will see updates here when events happen.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {notifications.map((n) => (
        <li
          key={n.notificationId}
          className={`flex items-start gap-3 rounded-lg border p-4 transition ${
            n.isRead
              ? 'border-gray-200 bg-white'
              : 'border-blue-200 bg-blue-50'
          }`}
        >
          <div
            className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
              n.isRead ? 'bg-gray-300' : 'bg-blue-600'
            }`}
          />
          <div className="min-w-0 flex-1">
            <p
              className={`text-sm ${
                n.isRead ? 'text-gray-700' : 'font-medium text-gray-900'
              }`}
            >
              {n.message}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {new Date(n.createdAt).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </div>
          {!n.isRead && (
            <button
              type="button"
              onClick={() => markRead(n.notificationId)}
              disabled={markingId === n.notificationId}
              className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 shrink-0"
            >
              <Check className="h-3 w-3" />
              {markingId === n.notificationId ? '...' : 'Read'}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}