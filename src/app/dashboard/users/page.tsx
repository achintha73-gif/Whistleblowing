import Link from 'next/link';
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
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            View, search, and manage all user accounts.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
          <Users className="h-4 w-4 text-blue-700" />
          <span className="text-sm font-medium text-blue-900">
            {users.length} user{users.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      <UserListTable users={users} />
    </div>
  );
}