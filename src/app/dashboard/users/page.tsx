import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { Users } from 'lucide-react';
import { listUsers } from '@/features/users/services/user-management.service';
import { UserListTable } from '@/features/users/components/UserListTable';

export const metadata = {
  title: 'Users - Whistleblowing System',
};

export default async function UsersPage() {
  const user = await getSession();
  if (!user) redirect('/login');

  if (user.roleName !== 'ADMIN') {
    redirect('/dashboard');
  }

  const users = await listUsers(user);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              User Management
            </h1>
            <p className="mt-0.5 text-sm text-gray-600">
              View, search, and manage all user accounts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-white/60 bg-white/60 px-3.5 py-2 shadow-lg shadow-blue-900/5 backdrop-blur-xl">
          <Users className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-semibold text-gray-900">
            {users.length} user{users.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      <UserListTable users={users} />
    </div>
  );
}