import type { CasePriority } from '../types';
import { CASE_PRIORITY_LABELS } from '../types';

const PRIORITY_STYLES: Record<CasePriority, string> = {
  LOW: 'bg-slate-100 text-slate-700 border-slate-200',
  MEDIUM: 'bg-sky-100 text-sky-700 border-sky-200',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
  CRITICAL: 'bg-red-100 text-red-700 border-red-200',
};

export function CasePriorityBadge({ priority }: { priority: CasePriority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLES[priority]}`}
    >
      {CASE_PRIORITY_LABELS[priority]}
    </span>
  );
}