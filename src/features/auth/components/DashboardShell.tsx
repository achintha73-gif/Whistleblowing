'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { DashboardSidebar } from './DashboardSidebar';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { UserMenu } from '@/features/auth/components/UserMenu';
import { Logo } from '@/components/Logo';
import type { SidebarBadges } from '../services/sidebar.service';
import type { RoleName, SafeUser } from '../types';

export function DashboardShell({
  user,
  badges,
  children,
}: {
  user: SafeUser;
  badges: SidebarBadges;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-blue-100 via-purple-100 to-gray-100">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed -top-40 -right-40 h-96 w-96 rounded-full bg-purple-300/30 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-300/30 blur-3xl" />
      <div className="pointer-events-none fixed top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-200/20 blur-3xl" />

      {/* Top header — glass */}
      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/40 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/60 bg-white/60 text-gray-700 transition hover:bg-white lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>

            <Link href="/dashboard" className="flex items-center gap-2.5">
              <Logo size={32} />
              <span className="hidden text-lg font-semibold text-gray-900 sm:inline">
                Whistleblowing System
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <UserMenu user={user} />
          </div>
        </div>
      </header>

      {/* Body: sidebar + main content */}
      <div className="relative z-10 flex flex-1">
        {/* Desktop sidebar — fixed width */}
        <div className="hidden w-64 shrink-0 lg:block">
          <DashboardSidebar
            roleName={user.roleName as RoleName}
            user={user}
            badges={badges}
          />
        </div>

        {/* Mobile sidebar (drawer) */}
        <div
          className={`fixed inset-0 z-50 lg:hidden ${
            sidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        >
          <div
            onClick={() => setSidebarOpen(false)}
            className={`absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300 ${
              sidebarOpen ? 'opacity-100' : 'opacity-0'
            }`}
          />

          <div
            className={`absolute left-0 top-0 h-full w-72 max-w-[80vw] transform transition-transform duration-300 ease-out ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="relative h-full">
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-white/70 text-gray-600 transition hover:bg-white"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>

              <DashboardSidebar
                roleName={user.roleName as RoleName}
                user={user}
                badges={badges}
                isMobile
              />
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      {/* Footer — glass */}
      <footer className="relative z-10 border-t border-white/60 bg-white/40 backdrop-blur-xl">
        <div className="px-6 py-3 text-xs text-gray-600">
          Whistleblowing Management System
        </div>
      </footer>
    </div>
  );
}