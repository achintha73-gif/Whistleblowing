'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';

export function NotificationBell() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchUnread() {
      try {
        const res = await fetch('/api/notifications');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setUnread(data.unreadCount ?? 0);
        }
      } catch {
        // silent
      }
    }

    fetchUnread();
    // Poll every 30 seconds
    const interval = setInterval(fetchUnread, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <Link
      href="/dashboard/notifications"
      className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
      aria-label="Notifications"
    >
      <Bell className="h-5 w-5" />
      {unread > 0 && (
        <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
          {unread > 99 ? '99+' : unread}
        </span>
      )}
    </Link>
  );
}