import Link from 'next/link';
import { CaseStatusBadge } from './CaseStatusBadge';
import { CasePriorityBadge } from './CasePriorityBadge';
import type { CaseSummary } from '../types';

export function CaseCard({ caseItem }: { caseItem: CaseSummary }) {
  return (
    <Link
      href={`/dashboard/cases/${caseItem.caseId}`}
      className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-blue-400 hover:shadow-md transition"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {caseItem.complaintTitle}
            </h3>
          </div>

          <div className="mt-2 flex items-center gap-2 text-xs flex-wrap">
            <CaseStatusBadge status={caseItem.status} />
            <CasePriorityBadge priority={caseItem.priority} />
          </div>

          <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 flex-wrap">
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
            <span>
              Opened{' '}
              {new Date(caseItem.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          <div className="mt-3 text-xs text-gray-400">
            Case #{caseItem.caseId} · Complaint #{caseItem.complaintId}
          </div>
        </div>
      </div>
    </Link>
  );
}