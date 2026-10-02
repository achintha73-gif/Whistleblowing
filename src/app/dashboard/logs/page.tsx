import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        <p className="mt-1 text-sm text-gray-600">
          {entries.length} recent system event{entries.length === 1 ? '' : 's'} across
          complaints, cases, evidence, reports, and users.
        </p>
      </div>

      <ActivityLogTable entries={entries} />
    </div>
  );
}