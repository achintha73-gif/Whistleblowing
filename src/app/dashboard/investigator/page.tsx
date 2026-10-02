import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { FolderOpen, FileText, Bell } from 'lucide-react';

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
          href="/dashboard/cases"
          title="My Assigned Cases"
          description="Cases assigned to you for investigation."
          icon={<FolderOpen className="h-6 w-6" />}
          accent="border-amber-200 hover:border-amber-400 text-amber-600"
        />
        <DashboardCard
          href="/dashboard/cases"
          title="Evidence"
          description="Review evidence attached to your cases."
          icon={<FileText className="h-6 w-6" />}
          accent="border-blue-200 hover:border-blue-400 text-blue-600"
        />
        <DashboardCard
          href="/dashboard/notifications"
          title="Notifications"
          description="Updates from managers and the system."
          icon={<Bell className="h-6 w-6" />}
          accent="border-green-200 hover:border-green-400 text-green-600"
        />
      </div>
    </div>
  );
}

function DashboardCard({
  href,
  title,
  description,
  icon,
  accent,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-lg border-2 bg-white p-5 shadow-sm transition ${accent}`}
    >
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  );
}