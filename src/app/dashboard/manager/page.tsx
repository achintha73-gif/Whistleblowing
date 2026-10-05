import Link from 'next/link';
import { getSession } from '@/lib/auth';
import {
  FileText,
  Clock,
  FolderOpen,
  UserX,
  ArrowRight,
  Eye,
  Shield,
  ClipboardList,
  Lock,
} from 'lucide-react';
import { getManagerDashboardStats } from '@/features/cases/services/case.service';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(date: Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default async function ManagerDashboardPage() {
  const user = await getSession();
  if (!user) return null;

  const stats = await getManagerDashboardStats();
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
            Review complaints, manage cases, and assign investigators.
          </p>
        </div>

        <Link
          href="/dashboard/complaints"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shrink-0 transition"
        >
          <FileText className="h-4 w-4" />
          Review Complaints
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Complaints"
          value={stats.totalComplaints}
          subtitle="All time"
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          icon={<FileText className="h-6 w-6" />}
        />
        <StatCard
          label="Pending Review"
          value={stats.pendingComplaints}
          subtitle="Awaiting action"
          gradient="bg-gradient-to-br from-amber-500 to-orange-500"
          icon={<Clock className="h-6 w-6" />}
        />
        <StatCard
          label="Active Cases"
          value={stats.openCases + stats.investigatingCases}
          subtitle={`${stats.openCases} open · ${stats.investigatingCases} investigating`}
          gradient="bg-gradient-to-br from-green-500 to-emerald-600"
          icon={<FolderOpen className="h-6 w-6" />}
        />
        <StatCard
          label="Unassigned Cases"
          value={stats.unassignedCases}
          subtitle="Need investigator"
          gradient="bg-gradient-to-br from-red-500 to-rose-600"
          icon={<UserX className="h-6 w-6" />}
        />
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink
          href="/dashboard/complaints"
          title="Review Complaints"
          description="View and action pending complaints submitted by employees."
          icon={<Eye className="h-5 w-5" />}
          accent="text-blue-600 bg-blue-50"
        />
        <QuickLink
          href="/dashboard/cases"
          title="Case Management"
          description="Assign investigators, monitor progress, and close cases."
          icon={<Shield className="h-5 w-5" />}
          accent="text-green-600 bg-green-50"
        />
        <QuickLink
          href="/dashboard/notifications"
          title="Notifications"
          description="Latest updates on cases and team activity."
          icon={<ClipboardList className="h-5 w-5" />}
          accent="text-purple-600 bg-purple-50"
        />
      </div>

      {/* Recent pending complaints */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Recent Pending Complaints
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Latest submissions awaiting manager review
            </p>
          </div>
          <Link
            href="/dashboard/complaints"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {stats.recentPending.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <FileText className="h-6 w-6 text-gray-400" />
            </div>
            <p className="mt-3 text-sm font-medium text-gray-900">
              No pending complaints
            </p>
            <p className="mt-1 text-xs text-gray-500">
              All caught up! New complaints will appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {stats.recentPending.map((c) => (
              <li key={c.complaint_id}>
                <Link
                  href={`/dashboard/complaints/${c.complaint_id}`}
                  className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-gray-50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    {c.isAnonymous ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {c.title}
                      </p>
                      {c.isAnonymous && (
                        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-600">
                          Anonymous
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                      {c.category && (
                        <>
                          <span>{c.category}</span>
                          <span>·</span>
                        </>
                      )}
                      <span>{formatDate(c.created_at)}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-gray-400" />
                </Link>
              </li>
            ))}
          </ul>
        )}
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
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accent}`}
      >
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