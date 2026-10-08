import Link from 'next/link';
import { formatDate } from '@/lib/date-format';
import { ComplaintStatusBadge } from './ComplaintStatusBadge';
import { CreateCaseButton } from '@/features/cases/components/CreateCaseButton';
import type { ComplaintSummary } from '../types';

export function ComplaintCard({
  complaint,
  showCreateCaseAction = false,
}: {
  complaint: ComplaintSummary;
  showCreateCaseAction?: boolean;
}) {
  const canCreateCase =
    showCreateCaseAction && complaint.status === 'PENDING';

  return (
    <div className="rounded-2xl border border-white/60 bg-white/60 p-4 shadow-lg shadow-blue-900/5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <Link
          href={`/dashboard/complaints/${complaint.complaintId}`}
          className="block min-w-0 flex-1"
        >
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold text-gray-900">
              {complaint.title}
            </h3>
            {complaint.isAnonymous && (
              <span className="inline-flex items-center rounded-full bg-white/70 px-2 py-0.5 text-xs font-medium text-gray-700">
                Anonymous
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
            {complaint.category && (
              <span className="rounded-md bg-white/70 px-2 py-0.5">
                {complaint.category}
              </span>
            )}
            <span>Submitted {formatDate(complaint.createdAt)}</span>
          </div>

          <div className="mt-3 text-xs text-gray-400">
            Complaint #{complaint.complaintId}
          </div>
        </Link>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <ComplaintStatusBadge status={complaint.status} />
          {canCreateCase && (
            <CreateCaseButton complaintId={complaint.complaintId} />
          )}
        </div>
      </div>
    </div>
  );
}