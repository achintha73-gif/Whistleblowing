import Link from 'next/link';
import { ComplaintStatusBadge } from './ComplaintStatusBadge';
import type { ComplaintSummary } from '../types';

export function ComplaintCard({ complaint }: { complaint: ComplaintSummary }) {
  return (
    <Link
      href={`/dashboard/complaints/${complaint.complaintId}`}
      className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-blue-400 hover:shadow-md transition"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {complaint.title}
            </h3>
            {complaint.isAnonymous && (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                Anonymous
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
            {complaint.category && (
              <span className="rounded-md bg-gray-100 px-2 py-0.5">
                {complaint.category}
              </span>
            )}
            <span>
              Submitted{' '}
              {new Date(complaint.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        <div className="shrink-0">
          <ComplaintStatusBadge status={complaint.status} />
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-400">
        Complaint #{complaint.complaintId}
      </div>
    </Link>
  );
}