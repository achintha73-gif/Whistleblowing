import Link from 'next/link';
import { getSession } from '@/lib/auth';
import {
  Users,
  UserCheck,
  AlertTriangle,
  Building2,
  ArrowRight,
  ShieldCheck,
  Settings as SettingsIcon,
  ScrollText,
} from 'lucide-react';
import { formatDate } from '@/lib/date-format';
import { getAdminStats } from '@/features/users/services/user-management.service';
import { EdukaStatCard } from '@/features/complaints/components/EdukaStatCard';
import {
  ROLE_BADGE_STYLES,
  STATUS_BADGE_STYLES,
} from '@/features/users/badge-styles';

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

  const activeRate =
    stats.totalUsers > 0
      ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, {user.name} 👋
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            System overview and administration.
          </p>
        </div>

        <Link
          href="/dashboard/users"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition shrink-0"
        >
          <Users className="h-4 w-4" />
          Manage Users
        </Link>
      </div>

      {/* Eduka stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <EdukaStatCard
          label="Total Users"
          value={stats.totalUsers}
          accent="blue"
          icon={<Users className="h-5 w-5" />}
          miniLabel="All accounts"
          miniValue={stats.totalUsers}
        />
        <EdukaStatCard
          label="Active Users"
          value={stats.activeUsers}
          accent="green"
          icon={<UserCheck className="h-5 w-5" />}
          miniLabel="Currently active"
          miniValue={stats.activeUsers}
        />
        <EdukaStatCard
          label="Suspended / Inactive"
          value={stats.suspendedUsers}
          accent="orange"
          icon={<AlertTriangle className="h-5 w-5" />}
          miniLabel="Cannot log in"
          miniValue={stats.suspendedUsers}
        />
        <EdukaStatCard
          label="Departments"
          value={stats.totalDepartments}
          accent="purple"
          icon={<Building2 className="h-5 w-5" />}
          miniLabel="Organization units"
          miniValue={stats.totalDepartments}
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Recent users */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recent Users
                  </h2>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Newest accounts in the system
                  </p>
                </div>
                {stats.recentUsers.length > 0 && (
                  <Link
                    href="/dashboard/users"
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    View all
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>

            <div className="p-4">
              {stats.recentUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-3">
                    <Users className="h-7 w-7" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    No users yet
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    User accounts will appear here once created.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {stats.recentUsers.map((u) => (
                    <li key={u.userId}>
                      <Link
                        href="/dashboard/users"
                        className="group flex items-start gap-3 rounded-xl border border-gray-100 p-3 hover:border-blue-300 hover:bg-blue-50/30 transition"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-semibold text-sm group-hover:bg-blue-200">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {u.name}
                            </h3>
                            <span
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${ROLE_BADGE_STYLES[u.roleName]}`}
                            >
                              {u.roleName}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-gray-500 truncate">
                            {u.email}
                          </p>
                          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                            <span
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_BADGE_STYLES[u.status]}`}
                            >
                              {u.status}
                            </span>
                            {u.departmentName && (
                              <span className="text-xs text-gray-500">
                                · {u.departmentName}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-gray-400">
                            Joined{' '}
                            {formatDate(u.createdAt)}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Right column: quick actions + summary */}
        <div className="space-y-4">
          {/* Quick actions */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-base font-semibold text-gray-900">
                Quick Actions
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">
                Admin tools at a glance
              </p>
            </div>
            <div className="p-3 space-y-2">
              <QuickAction
                href="/dashboard/users"
                title="User Management"
                description="Search, roles, and status control"
                icon={<Users className="h-4 w-4" />}
                accent="bg-blue-50 text-blue-600"
              />
              <QuickAction
                href="/dashboard/settings"
                title="System Settings"
                description="Configure global options"
                icon={<SettingsIcon className="h-4 w-4" />}
                accent="bg-purple-50 text-purple-600"
              />
              <QuickAction
                href="/dashboard/logs"
                title="Activity Logs"
                description="Audit trail of system events"
                icon={<ScrollText className="h-4 w-4" />}
                accent="bg-amber-50 text-amber-600"
              />
            </div>
          </div>

          {/* System overview */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-semibold text-gray-900">
                System Overview
              </h3>
            </div>
            <div className="space-y-3">
              <WorkloadBar
                label="Active Users"
                value={stats.activeUsers}
                total={stats.totalUsers}
                color="bg-emerald-500"
              />
              <WorkloadBar
                label="Inactive"
                value={stats.suspendedUsers}
                total={stats.totalUsers}
                color="bg-orange-500"
              />
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Active rate</span>
                <span className="font-semibold text-gray-900">
                  {activeRate}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({
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
      className="group flex items-start gap-3 rounded-xl p-3 transition hover:bg-gray-50"
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accent}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          <ArrowRight className="h-3 w-3 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-gray-600" />
        </div>
        <p className="mt-0.5 text-xs text-gray-500">{description}</p>
      </div>
    </Link>
  );
}

function WorkloadBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">
          {value}{' '}
          <span className="text-gray-400 font-normal">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${Math.max(2, pct)}%` }}
        />
      </div>
    </div>
  );
}