import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { LogoutButton } from '@/features/auth/components/LogoutButton';
import { UserBadge } from '@/features/auth/components/UserBadge';
import { DashboardSidebar } from '@/features/auth/components/DashboardSidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between px-6 py-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-900">
              Whistleblowing System
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <UserBadge user={user} />
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Body: sidebar + main content */}
      <div className="flex flex-1">
        <DashboardSidebar roleName={user.roleName} user={user} />

        <main className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="px-6 py-3 text-xs text-gray-500">
          Whistleblowing Management System
        </div>
      </footer>
    </div>
  );
}