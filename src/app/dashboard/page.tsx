import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function DashboardRootPage() {
  const user = await getSession();
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
      <h1 className="text-2xl font-bold text-gray-900">
        Welcome, {user.name}
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        You are signed in as <strong>{user.roleName}</strong>.
      </p>
      <p className="mt-4 text-sm text-gray-500">
        Dashboard widgets will appear here soon.
      </p>
    </div>
  );
}