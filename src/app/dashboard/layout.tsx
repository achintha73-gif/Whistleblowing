import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { DashboardSidebar } from '@/features/auth/components/DashboardSidebar';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { UserMenu } from '@/features/auth/components/UserMenu';
import { getSidebarBadges } from '@/features/auth/services/sidebar.service';
import { Logo } from '@/components/Logo';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) {
    redirect('/login');
  }

  const badges = await getSidebarBadges(user);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-gray-100 flex flex-col">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed -top-40 -right-40 h-96 w-96 rounded-full bg-purple-300/30 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-300/30 blur-3xl" />
      <div className="pointer-events-none fixed top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-200/20 blur-3xl" />

      {/* Top header — glass */}
      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/40 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-3">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Logo size={32} />
            <span className="text-lg font-semibold text-gray-900">
              Whistleblowing System
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <UserMenu user={user} />
          </div>
        </div>
      </header>

      {/* Body: sidebar + main content */}
      <div className="relative z-10 flex flex-1">
        <DashboardSidebar
          roleName={user.roleName}
          user={user}
          badges={badges}
        />

        <main className="flex-1 overflow-auto p-6">
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