'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, Loader2 } from 'lucide-react';
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
      <div className="rounded-3xl border-2 border-dashed border-gray-300 bg-white/60 p-12 text-center backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Bell className="h-7 w-7" />
        </div>
        <p className="mt-3 text-sm font-semibold text-gray-900">
          No notifications
        </p>
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
          className={`group relative flex items-start gap-3 overflow-hidden rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
            n.isRead
              ? 'border-white/60 bg-white/60 backdrop-blur-xl shadow-blue-900/5'
              : 'border-blue-200/60 bg-gradient-to-br from-blue-50/90 to-indigo-50/90 backdrop-blur-xl shadow-blue-500/10'
          }`}
        >
          {/* Unread accent bar */}
          {!n.isRead && (
            <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-blue-500 to-indigo-600" />
          )}

          {/* Status dot */}
          <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/70 backdrop-blur-sm">
            {n.isRead ? (
              <Bell className="h-4 w-4 text-gray-400" />
            ) : (
              <Bell className="h-4 w-4 text-blue-600" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p
              className={`text-sm leading-relaxed ${
                n.isRead ? 'text-gray-700' : 'font-medium text-gray-900'
              }`}
            >
              {n.message}
            </p>
            <p className="mt-1.5 text-xs text-gray-500">
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
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-blue-500/25 transition hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg disabled:opacity-60"
            >
              {markingId === n.notificationId ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Check className="h-3 w-3" />
              )}
              {markingId === n.notificationId ? '...' : 'Mark read'}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}