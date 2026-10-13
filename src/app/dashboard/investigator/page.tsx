import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import {
  FolderOpen,
  Clock,
  Search,
  CheckCircle,
  Paperclip,
  ArrowRight,
  Bell,
} from 'lucide-react';
import { formatShortDate } from '@/lib/date-format';
import { getInvestigatorDashboardStats } from '@/features/cases/services/case.service';
import { getGreeting } from '@/lib/greeting';
import { EdukaStatCard } from '@/features/complaints/components/EdukaStatCard';
import { CaseStatusBadge } from '@/features/cases/components/CaseStatusBadge';
import { CasePriorityBadge } from '@/features/cases/components/CasePriorityBadge';
import type { CaseStatus, CasePriority } from '@/features/cases/types';

export default async function InvestigatorDashboardPage() {
  const user = await getSession();
  if (!user) return null;

  // Role guard — only INVESTIGATOR can access this dashboard
  if (user.roleName !== 'INVESTIGATOR') {
    const ROLE_DASHBOARDS: Record<string, string> = {
      ADMIN: '/dashboard/admin',
      MANAGER: '/dashboard/manager',
      USER: '/dashboard/user',
    };
    redirect(ROLE_DASHBOARDS[user.roleName] ?? '/dashboard/user');
  }

  const stats = await getInvestigatorDashboardStats(user.userId);
  const greeting = getGreeting();

  const completionRate =
    stats.totalCases > 0
      ? Math.round((stats.closedCases / stats.totalCases) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {greeting}, {user.name} 👋
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Here is your investigation load.
          </p>
        </div>

        <Link
          href="/dashboard/cases"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/40"
        >
          <FolderOpen className="h-4 w-4" />
          View My Cases
        </Link>
      </div>

      {/* Eduka stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <EdukaStatCard
          label="Total Cases"
          value={stats.totalCases}
          accent="blue"
          icon={<FolderOpen className="h-5 w-5" />}
          miniLabel="Assigned to me"
          miniValue={stats.totalCases}
        />
        <EdukaStatCard
          label="Open"
          value={stats.openCases}
          accent="orange"
          icon={<Clock className="h-5 w-5" />}
          miniLabel="Not started"
          miniValue={stats.openCases}
        />
        <EdukaStatCard
          label="Investigating"
          value={stats.investigatingCases}
          accent="purple"
          icon={<Search className="h-5 w-5" />}
          miniLabel="In progress"
          miniValue={stats.investigatingCases}
        />
        <EdukaStatCard
          label="Evidence Files"
          value={stats.evidenceCount}
          accent="green"
          icon={<Paperclip className="h-5 w-5" />}
          miniLabel="Collected"
          miniValue={stats.evidenceCount}
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: Recent cases */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-white/60 bg-white/60 shadow-lg shadow-blue-900/5 backdrop-blur-xl">
            <div className="border-b border-white/60 px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Active Cases
                  </h2>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Your most recently updated cases
                  </p>
                </div>
                {stats.recentCases.length > 0 && (
                  <Link
                    href="/dashboard/cases"
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    View all
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>

            <div className="p-4">
              {stats.recentCases.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle className="h-7 w-7" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    No active cases
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    You&apos;re all caught up. Great work!
                  </p>
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {stats.recentCases.map((c) => (
                    <li key={c.caseId}>
                      <Link
                        href={`/dashboard/cases/${c.caseId}`}
                        className="group relative flex items-start gap-3 overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br from-white/80 to-white/40 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:from-white hover:to-blue-50/60 hover:shadow-xl hover:shadow-blue-500/10"
                      >
                        {/* Shine effect */}
                        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                        {/* Icon with 3D */}
                        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                          <FolderOpen className="h-5 w-5 text-white drop-shadow-sm" strokeWidth={2.5} />
                        </div>

                        <div className="relative min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-sm font-bold text-gray-900 transition group-hover:text-blue-700">
                              {c.complaintTitle}
                            </h3>
                            {c.isAnonymous && (
                              <span className="shrink-0 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600 shadow-sm">
                                Anonymous
                              </span>
                            )}
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            <CaseStatusBadge status={c.status as CaseStatus} />
                            <CasePriorityBadge
                              priority={c.priority as CasePriority}
                            />
                            {c.category && (
                              <span className="text-xs font-medium text-gray-500">
                                · {c.category}
                              </span>
                            )}
                          </div>
                          <p className="mt-1.5 text-xs text-gray-400">
                            Case #{c.caseId} · Updated{' '}
                            {formatShortDate(c.updatedAt)}
                          </p>
                        </div>

                        {/* Arrow with circle bg */}
                        <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/60 shadow-sm transition-all duration-300 group-hover:bg-blue-600 group-hover:shadow-md">
                          <ArrowRight className="h-3.5 w-3.5 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-white" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/60 bg-white/60 shadow-lg shadow-blue-900/5 backdrop-blur-xl">
            <div className="border-b border-white/60 px-5 py-4">
              <h2 className="text-base font-semibold text-gray-900">
                Quick Actions
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">
                Jump to your tools
              </p>
            </div>
            <div className="space-y-2 p-3">
              <QuickAction
                href="/dashboard/cases"
                title="My Cases"
                description="View and update your assigned cases"
                icon={<FolderOpen className="h-4 w-4" />}
                accent="bg-blue-50 text-blue-600"
              />
              <QuickAction
                href="/dashboard/evidence"
                title="Evidence"
                description="Review uploaded evidence"
                icon={<Paperclip className="h-4 w-4" />}
                accent="bg-emerald-50 text-emerald-600"
              />
              <QuickAction
                href="/dashboard/notifications"
                title="Notifications"
                description={`${stats.unreadNotifications} unread`}
                icon={<Bell className="h-4 w-4" />}
                accent="bg-amber-50 text-amber-600"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/60 p-5 shadow-lg shadow-blue-900/5 backdrop-blur-xl">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Case Progress
            </h3>
            <div className="space-y-3">
              <WorkloadBar
                label="Open"
                value={stats.openCases}
                total={stats.totalCases}
                color="bg-orange-500"
              />
              <WorkloadBar
                label="Investigating"
                value={stats.investigatingCases}
                total={stats.totalCases}
                color="bg-violet-500"
              />
              <WorkloadBar
                label="Pending Review"
                value={stats.pendingReviewCases}
                total={stats.totalCases}
                color="bg-blue-500"
              />
              <WorkloadBar
                label="Completed"
                value={stats.closedCases}
                total={stats.totalCases}
                color="bg-emerald-500"
              />
            </div>
            <div className="mt-4 border-t border-white/60 pt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Completion rate</span>
                <span className="font-semibold text-gray-900">
                  {completionRate}%
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
      className="group relative flex items-start gap-3 overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br from-white/80 to-white/40 p-3.5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:from-white hover:to-blue-50/60 hover:shadow-lg hover:shadow-blue-500/10"
    >
      {/* Shine */}
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

      {/* Icon with 3D */}
      <div
        className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent} shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
      >
        {icon}
      </div>

      <div className="relative min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-bold text-gray-900 transition group-hover:text-blue-700">
            {title}
          </h3>
          <ArrowRight className="h-3.5 w-3.5 text-gray-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-blue-600" />
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
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">
          {value}{' '}
          <span className="font-normal text-gray-400">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/60">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${Math.max(2, pct)}%` }}
        />
      </div>
    </div>
  );
}