import Link from 'next/link';
import { getSession } from '@/lib/auth';
import {
  FileText,
  Clock,
  FolderOpen,
  AlertTriangle,
  ArrowRight,
  Plus,
  TrendingUp,
} from 'lucide-react';
import {
  getManagerDashboardData,
} from '@/features/complaints/services/complaint.service';
import { EdukaStatCard } from '@/features/complaints/components/EdukaStatCard';
import { ComplaintCard } from '@/features/complaints/components/ComplaintCard';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default async function ManagerDashboardPage() {
  const user = await getSession();
  if (!user) return null;

  const data = await getManagerDashboardData();
  const greeting = getGreeting();

  // Compute some derived metrics
  const reviewRate =
    data.totalComplaints > 0
      ? Math.round(
          ((data.totalComplaints - data.pendingCount) /
            data.totalComplaints) *
            100
        )
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
            Here is what needs your attention today.
          </p>
        </div>

        <Link
          href="/dashboard/complaints"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition shrink-0"
        >
          <Plus className="h-4 w-4" />
          Review Complaints
        </Link>
      </div>

      {/* Eduka-style stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <EdukaStatCard
          label="Total Complaints"
          value={data.totalComplaints}
          accent="green"
          icon={<FileText className="h-5 w-5" />}
          miniLabel="Reviewed"
          miniValue={`${reviewRate}%`}
        />
        <EdukaStatCard
          label="Pending Review"
          value={data.pendingCount}
          accent="orange"
          icon={<Clock className="h-5 w-5" />}
          miniLabel="Awaiting action"
          miniValue={data.pendingCount}
        />
        <EdukaStatCard
          label="Active Cases"
          value={data.activeCases}
          accent="purple"
          icon={<FolderOpen className="h-5 w-5" />}
          miniLabel="In progress"
          miniValue={data.activeCases}
        />
        <EdukaStatCard
          label="Unassigned"
          value={data.unassignedCases}
          accent="red"
          icon={<AlertTriangle className="h-5 w-5" />}
          miniLabel="Need investigator"
          miniValue={data.unassignedCases}
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Recent Pending Complaints */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            {/* Section header with tabs */}
            <div className="border-b border-gray-100 px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Pending Review
                  </h2>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Complaints awaiting your decision
                  </p>
                </div>
                {data.pendingCount > 0 && (
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

            {/* Body */}
            <div className="p-4">
              {data.recentPending.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-3">
                    <TrendingUp className="h-7 w-7" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    You&apos;re all caught up!
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    No pending complaints at the moment.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.recentPending.map((complaint) => (
                    <ComplaintCard
                      key={complaint.complaintId}
                      complaint={complaint}
                      showCreateCaseAction={true}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Quick Actions */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-base font-semibold text-gray-900">
                Quick Actions
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">
                Jump to important tasks
              </p>
            </div>
            <div className="p-3 space-y-2">
              <QuickAction
                href="/dashboard/complaints"
                title="Review Complaints"
                description="Convert pending complaints to cases"
                icon={<FileText className="h-4 w-4" />}
                accent="bg-blue-50 text-blue-600"
              />
              <QuickAction
                href="/dashboard/cases"
                title="Manage Cases"
                description="Assign investigators and monitor"
                icon={<FolderOpen className="h-4 w-4" />}
                accent="bg-violet-50 text-violet-600"
              />
              <QuickAction
                href="/dashboard/notifications"
                title="Notifications"
                description="Recent updates from the system"
                icon={<AlertTriangle className="h-4 w-4" />}
                accent="bg-amber-50 text-amber-600"
              />
            </div>
          </div>

          {/* Workload summary */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Workload Summary
            </h3>
            <div className="space-y-3">
              <WorkloadBar
                label="Reviewed"
                value={data.totalComplaints - data.pendingCount}
                total={data.totalComplaints}
                color="bg-emerald-500"
              />
              <WorkloadBar
                label="Pending"
                value={data.pendingCount}
                total={data.totalComplaints}
                color="bg-orange-500"
              />
              <WorkloadBar
                label="Active Cases"
                value={data.activeCases}
                total={data.totalComplaints}
                color="bg-violet-500"
              />
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