'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Check, Loader2, ArrowRight } from 'lucide-react';

interface Notification {
  notificationId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const router = useRouter();
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [markingId, setMarkingId] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Poll unread count every 30s
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
    const interval = setInterval(fetchUnread, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [open]);

  // Fetch notifications when dropdown opens (fresh data)
  async function loadNotifications() {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnread(data.unreadCount ?? 0);
      setLoaded(true);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next) {
      loadNotifications();
    }
  }

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
      setUnread((u) => Math.max(0, u - 1));
    } catch {
      // silent
    } finally {
      setMarkingId(null);
    }
  }

  const recent = notifications.slice(0, 5);

  return (
    <div ref={panelRef} className="relative">
      {/* Bell button */}
      <button
        type="button"
        onClick={toggleOpen}
        className={`relative inline-flex items-center justify-center rounded-xl border p-2 transition ${
          open
            ? 'border-blue-300 bg-blue-50 text-blue-700'
            : 'border-white/60 bg-white/60 text-gray-600 hover:bg-white hover:text-gray-900'
        }`}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="h-4.5 w-4.5" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 px-1 text-[10px] font-bold text-white shadow-md shadow-red-500/30">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 origin-top-right overflow-hidden rounded-2xl border border-white/60 bg-white/90 shadow-2xl shadow-blue-900/10 backdrop-blur-xl sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/60 bg-white/60 px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Notifications
              </h3>
              <p className="text-[11px] text-gray-500">
                {unread > 0
                  ? `${unread} unread`
                  : 'You are all caught up'}
              </p>
            </div>
            {loading && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
            )}
          </div>

          {/* Body */}
          <div className="max-h-[400px] overflow-y-auto">
            {!loaded && loading ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <p className="mt-2 text-xs text-gray-500">Loading...</p>
              </div>
            ) : recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <Bell className="h-5 w-5" />
                </div>
                <p className="mt-2 text-xs font-medium text-gray-900">
                  No notifications
                </p>
                <p className="mt-0.5 text-[11px] text-gray-500">
                  Updates will appear here
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-white/60">
                {recent.map((n) => (
                  <li
                    key={n.notificationId}
                    className={`group flex items-start gap-3 px-4 py-3 transition ${
                      n.isRead
                        ? 'bg-white/40 hover:bg-white/70'
                        : 'bg-blue-50/60 hover:bg-blue-50/90'
                    }`}
                  >
                    {/* Unread dot */}
                    <div className="mt-1.5 flex h-2 w-2 shrink-0">
                      {!n.isRead && (
                        <span className="h-2 w-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm leading-snug ${
                          n.isRead
                            ? 'text-gray-700'
                            : 'font-medium text-gray-900'
                        }`}
                      >
                        {n.message}
                      </p>
                      <p className="mt-1 text-[11px] text-gray-500">
                        {formatRelativeTime(n.createdAt)}
                      </p>
                    </div>

                    {!n.isRead && (
                      <button
                        type="button"
                        onClick={() => markRead(n.notificationId)}
                        disabled={markingId === n.notificationId}
                        className="shrink-0 rounded-lg border border-blue-200 bg-white/70 p-1.5 text-blue-600 transition hover:bg-blue-100 disabled:opacity-50"
                        aria-label="Mark as read"
                        title="Mark as read"
                      >
                        {markingId === n.notificationId ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/60 bg-white/60">
            <Link
              href="/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="group flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-medium text-blue-600 transition hover:bg-blue-50/60"
            >
              View all notifications
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}