import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { Users, UserCheck, AlertTriangle, Building2, ArrowRight } from 'lucide-react';
import { getAdminStats } from '@/features/users/services/user-management.service';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default async function AdminDashboardPage() {
  const user = await getSession();
  if (!user) return null;

  const stats = await getAdminStats();
  const greeting = getGreeting();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, {user.name}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            System overview and administration.
          </p>
        </div>

        <Link
          href="/dashboard/users"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shrink-0 transition"
        >
          <Users className="h-4 w-4" />
          Manage Users
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          subtitle="All accounts"
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          icon={<Users className="h-6 w-6" />}
        />
        <StatCard
          label="Active Users"
          value={stats.activeUsers}
          subtitle="Currently active"
          gradient="bg-gradient-to-br from-green-500 to-emerald-600"
          icon={<UserCheck className="h-6 w-6" />}
        />
        <StatCard
          label="Suspended / Inactive"
          value={stats.suspendedUsers}
          subtitle="Cannot log in"
          gradient="bg-gradient-to-br from-amber-500 to-orange-500"
          icon={<AlertTriangle className="h-6 w-6" />}
        />
        <StatCard
          label="Departments"
          value={stats.totalDepartments}
          subtitle="Organization units"
          gradient="bg-gradient-to-br from-purple-500 to-violet-600"
          icon={<Building2 className="h-6 w-6" />}
        />
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink
          href="/dashboard/users"
          title="User Management"
          description="View, search, and manage all user accounts. Change roles and statuses."
          icon={<Users className="h-5 w-5" />}
          accent="text-blue-600 bg-blue-50"
        />
        <QuickLink
          href="/dashboard/settings"
          title="System Settings"
          description="Configure global settings and system behavior."
          icon={<Building2 className="h-5 w-5" />}
          accent="text-purple-600 bg-purple-50"
        />
        <QuickLink
          href="/dashboard/logs"
          title="Activity Logs"
          description="Audit trail of system events. Coming in a future version."
          icon={<AlertTriangle className="h-5 w-5" />}
          accent="text-amber-600 bg-amber-50"
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  subtitle,
  gradient,
  icon,
}: {
  label: string;
  value: number;
  subtitle: string;
  gradient: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-xl ${gradient} p-5 text-white shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-1`}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium uppercase tracking-wider text-white/80">
            {label}
          </div>
          <div className="mt-1 text-3xl font-bold text-white">{value}</div>
          <div className="mt-0.5 text-xs text-white/70">{subtitle}</div>
        </div>
      </div>
      <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/10" />
    </div>
  );
}

function QuickLink({
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
      className="group flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:border-blue-400 hover:shadow-md transition"
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accent}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <ArrowRight className="h-4 w-4 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-gray-600" />
        </div>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      </div>
    </Link>
  );
}