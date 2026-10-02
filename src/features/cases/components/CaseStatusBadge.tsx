import type { CaseStatus } from '../types';
import { CASE_STATUS_LABELS } from '../types';

const STATUS_STYLES: Record<CaseStatus, string> = {
  OPEN: 'bg-blue-100 text-blue-800 border-blue-200',
  INVESTIGATING: 'bg-amber-100 text-amber-800 border-amber-200',
  PENDING_REVIEW: 'bg-purple-100 text-purple-800 border-purple-200',
  CLOSED: 'bg-green-100 text-green-800 border-green-200',
  ARCHIVED: 'bg-gray-100 text-gray-700 border-gray-200',
};

export function CaseStatusBadge({ status }: { status: CaseStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {CASE_STATUS_LABELS[status]}
    </span>
  );
}