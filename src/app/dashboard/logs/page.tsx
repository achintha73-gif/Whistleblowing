import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { ScrollText } from 'lucide-react';
import { ActivityLogTable } from '@/features/logs/components/ActivityLogTable';
import { getActivityLog } from '@/features/logs/services/logs.service';

export const metadata = {
  title: 'Activity Logs - Whistleblowing System',
};

export default async function LogsPage() {
  const user = await getSession();
  if (!user) redirect('/login');

  if (user.roleName !== 'ADMIN') {
    redirect('/dashboard');
  }

  const entries = await getActivityLog(200);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
          <ScrollText className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Activity Log
          </h1>
          <p className="mt-0.5 text-sm text-gray-600">
            {entries.length} recent system event
            {entries.length === 1 ? '' : 's'} across complaints, cases,
            evidence, reports, and users.
          </p>
        </div>
      </div>

      <ActivityLogTable entries={entries} />
    </div>
  );
}