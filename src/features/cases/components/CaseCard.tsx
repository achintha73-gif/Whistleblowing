import Link from 'next/link';
import { formatDate } from '@/lib/date-format';
import { CaseStatusBadge } from './CaseStatusBadge';
import { CasePriorityBadge } from './CasePriorityBadge';
import type { CaseSummary } from '../types';

export function CaseCard({ caseItem }: { caseItem: CaseSummary }) {
  return (
    <Link
      href={`/dashboard/cases/${caseItem.caseId}`}
      className="block rounded-2xl border border-white/60 bg-white/60 p-4 shadow-lg shadow-blue-900/5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-xl"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold text-gray-900">
              {caseItem.complaintTitle}
            </h3>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <CaseStatusBadge status={caseItem.status} />
            <CasePriorityBadge priority={caseItem.priority} />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span>
              {caseItem.assignedInvestigator ? (
                <>
                  Investigator:{' '}
                  <span className="font-medium text-gray-700">
                    {caseItem.assignedInvestigator.name}
                  </span>
                </>
              ) : (
                <span className="italic text-amber-600">Unassigned</span>
              )}
            </span>
            <span>Opened {formatDate(caseItem.createdAt)}</span>
          </div>

          <div className="mt-3 text-xs text-gray-400">
            Case #{caseItem.caseId} · Complaint #{caseItem.complaintId}
          </div>
        </div>
      </div>
    </Link>
  );
}