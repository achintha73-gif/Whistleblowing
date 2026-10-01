import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { LogoutButton } from '@/features/auth/components/LogoutButton';
import { UserBadge } from '@/features/auth/components/UserBadge';

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
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
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

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        {children}
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 text-xs text-gray-500">
          Whistleblowing Management System
        </div>
      </footer>
    </div>
  );
}