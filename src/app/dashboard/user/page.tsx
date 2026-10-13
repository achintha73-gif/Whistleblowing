import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import {
  FileText,
  Clock,
  Search,
  CheckCircle,
  Plus,
  ArrowRight,
  Bell,
  ListChecks,
} from 'lucide-react';
import { EdukaStatCard } from '@/features/complaints/components/EdukaStatCard';
import { ComplaintCard } from '@/features/complaints/components/ComplaintCard';
import { getUserComplaintStats } from '@/features/complaints/services/complaint.service';
import { getGreeting } from '@/lib/greeting';

export default async function UserDashboardPage() {
  const user = await getSession();
  if (!user) return null;

  // Role guard — only USER can access this dashboard
  if (user.roleName !== 'USER') {
    const ROLE_DASHBOARDS: Record<string, string> = {
      ADMIN: '/dashboard/admin',
      MANAGER: '/dashboard/manager',
      INVESTIGATOR: '/dashboard/investigator',
    };
    redirect(ROLE_DASHBOARDS[user.roleName] ?? '/dashboard/admin');
  }

  const stats = await getUserComplaintStats(user);
  const greeting = getGreeting();

  const resolvedCount =
    stats.approved + stats.rejected + stats.convertedToCase;

  const resolutionRate =
    stats.total > 0 ? Math.round((resolvedCount / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {greeting}, {user.name} 👋
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Here is an overview of your concerns.
          </p>
        </div>

        <Link
          href="/dashboard/complaints/new"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/40"
        >
          <Plus className="h-4 w-4" />
          Submit New Concern
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <EdukaStatCard
          label="Total"
          value={stats.total}
          accent="blue"
          icon={<FileText className="h-5 w-5" />}
          miniLabel="Submitted"
          miniValue={stats.total}
        />
        <EdukaStatCard
          label="Pending"
          value={stats.pending}
          accent="orange"
          icon={<Clock className="h-5 w-5" />}
          miniLabel="Awaiting review"
          miniValue={stats.pending}
        />
        <EdukaStatCard
          label="Under Review"
          value={stats.underReview}
          accent="purple"
          icon={<Search className="h-5 w-5" />}
          miniLabel="Being investigated"
          miniValue={stats.underReview}
        />
        <EdukaStatCard
          label="Resolved"
          value={resolvedCount}
          accent="green"
          icon={<CheckCircle className="h-5 w-5" />}
          miniLabel="Closed / converted"
          miniValue={resolvedCount}
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-white/60 bg-white/60 shadow-lg shadow-blue-900/5 backdrop-blur-xl">
            <div className="border-b border-white/60 px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recent Concerns
                  </h2>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Your most recently submitted concerns
                  </p>
                </div>
                {stats.total > 0 && (
                  <Link
                    href="/dashboard/complaints"
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    View all
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>

            <div className="p-4">
              {stats.recent.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <FileText className="h-7 w-7" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    No concerns yet
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    When you submit a concern, it will appear here.
                  </p>
                  <Link
                    href="/dashboard/complaints/new"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Submit your first concern
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recent.map((complaint) => (
                    <ComplaintCard
                      key={complaint.complaintId}
                      complaint={complaint}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/60 bg-white/60 shadow-lg shadow-blue-900/5 backdrop-blur-xl">
            <div className="border-b border-white/60 px-5 py-4">
              <h2 className="text-base font-semibold text-gray-900">
                Quick Actions
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">
                Common tasks at a glance
              </p>
            </div>
            <div className="space-y-2 p-3">
              <QuickAction
                href="/dashboard/complaints/new"
                title="Submit Concern"
                description="File a new concern"
                icon={<Plus className="h-4 w-4" />}
                accent="bg-blue-50 text-blue-600"
              />
              <QuickAction
                href="/dashboard/complaints"
                title="My Concerns"
                description="View and track your concerns"
                icon={<ListChecks className="h-4 w-4" />}
                accent="bg-emerald-50 text-emerald-600"
              />
              <QuickAction
                href="/dashboard/notifications"
                title="Notifications"
                description="Updates on your concerns"
                icon={<Bell className="h-4 w-4" />}
                accent="bg-amber-50 text-amber-600"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/60 p-5 shadow-lg shadow-blue-900/5 backdrop-blur-xl">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Concern Progress
            </h3>
            <div className="space-y-3">
              <WorkloadBar
                label="Pending"
                value={stats.pending}
                total={stats.total}
                color="bg-orange-500"
              />
              <WorkloadBar
                label="Under Review"
                value={stats.underReview}
                total={stats.total}
                color="bg-violet-500"
              />
              <WorkloadBar
                label="Resolved"
                value={resolvedCount}
                total={stats.total}
                color="bg-emerald-500"
              />
            </div>
            <div className="mt-4 border-t border-white/60 pt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Resolution rate</span>
                <span className="font-semibold text-gray-900">
                  {resolutionRate}%
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
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
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