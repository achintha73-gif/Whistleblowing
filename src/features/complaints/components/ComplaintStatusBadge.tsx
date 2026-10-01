import type { ComplaintStatus } from '../types';

const STATUS_STYLES: Record<ComplaintStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  UNDER_REVIEW: 'bg-blue-100 text-blue-800 border-blue-200',
  APPROVED: 'bg-green-100 text-green-800 border-green-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
  CONVERTED_TO_CASE: 'bg-purple-100 text-purple-800 border-purple-200',
};

const STATUS_LABELS: Record<ComplaintStatus, string> = {
  PENDING: 'Pending',
  UNDER_REVIEW: 'Under review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CONVERTED_TO_CASE: 'Converted to case',
};

export function ComplaintStatusBadge({ status }: { status: ComplaintStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}