import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { FileText, Clock, Search, CheckCircle, Plus } from 'lucide-react';
import { StatCard } from '@/features/complaints/components/StatCard';
import { ComplaintCard } from '@/features/complaints/components/ComplaintCard';
import { getUserComplaintStats } from '@/features/complaints/services/complaint.service';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default async function UserDashboardPage() {
  const user = await getSession();
  if (!user) return null;

  const stats = await getUserComplaintStats(user);
  const greeting = getGreeting();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, {user.name}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Here is an overview of your complaints.
          </p>
        </div>

        <Link
          href="/dashboard/complaints/new"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shrink-0 transition"
        >
          <Plus className="h-4 w-4" />
          Submit New Complaint
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total"
          value={stats.total}
          subtitle="Complaints submitted"
          accent="blue"
          icon={<FileText className="h-6 w-6" />}
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          subtitle="Awaiting review"
          accent="amber"
          icon={<Clock className="h-6 w-6" />}
        />
        <StatCard
          label="Under Review"
          value={stats.underReview}
          subtitle="Being investigated"
          accent="purple"
          icon={<Search className="h-6 w-6" />}
        />
        <StatCard
          label="Resolved"
          value={stats.approved + stats.rejected + stats.convertedToCase}
          subtitle="Approved / rejected / case"
          accent="green"
          icon={<CheckCircle className="h-6 w-6" />}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Complaints
          </h2>
          {stats.total > 0 && (
            <Link
              href="/dashboard/complaints"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition"
            >
              View all &rarr;
            </Link>
          )}
        </div>

        {stats.recent.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-3">
              <FileText className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              No complaints yet
            </p>
            <p className="text-sm text-gray-500 mb-4">
              When you submit a complaint, it will appear here.
            </p>
            <Link
              href="/dashboard/complaints/new"
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
            >
              <Plus className="h-4 w-4" />
              Submit your first complaint
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
  );
}