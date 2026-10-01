import Link from 'next/link';
import { getSession } from '@/lib/auth';

export default async function InvestigatorDashboardPage() {
  const user = await getSession();
  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Investigator Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome, {user.name}. Manage your assigned cases and evidence.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          href="/investigations"
          title="My Assigned Cases"
          description="Cases assigned to you for investigation."
          accent="amber"
        />
        <DashboardCard
          href="/evidence"
          title="Evidence"
          description="Upload and review evidence for your cases."
          accent="blue"
        />
        <DashboardCard
          href="/notifications"
          title="Notifications"
          description="Updates from managers and the system."
          accent="green"
        />
      </div>
    </div>
  );
}

function DashboardCard({
  href,
  title,
  description,
  accent,
}: {
  href: string;
  title: string;
  description: string;
  accent: 'blue' | 'green' | 'amber' | 'purple';
}) {
  const colors = {
    blue: 'border-blue-200 hover:border-blue-400',
    green: 'border-green-200 hover:border-green-400',
    amber: 'border-amber-200 hover:border-amber-400',
    purple: 'border-purple-200 hover:border-purple-400',
  } as const;

  return (
    <Link
      href={href}
      className={`block rounded-lg border-2 bg-white p-5 shadow-sm transition ${colors[accent]}`}
    >
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
    </Link>
  );
}