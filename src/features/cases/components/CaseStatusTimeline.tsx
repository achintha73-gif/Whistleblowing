import { CaseStatusBadge } from './CaseStatusBadge';
import { Info } from 'lucide-react';
import { formatDateTime } from '@/lib/date-format';
import type { CaseStatus } from '../types';

interface HistoryEntry {
  history_id: number;
  status: string;
  changed_at: Date;
  note?: string | null;
  changedBy: {
    user_id: number;
    name: string;
  };
}

export function CaseStatusTimeline({ history }: { history: HistoryEntry[] }) {
  if (history.length === 0) {
    return (
      <p className="text-sm italic text-gray-500">No status history yet.</p>
    );
  }

  return (
    <ol className="space-y-4">
      {history.map((entry, idx) => {
        const isLast = idx === history.length - 1;
        return (
          <li key={entry.history_id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-3 w-3 shrink-0 rounded-full ${
                  isLast ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
              {!isLast && <div className="mt-1 w-0.5 flex-1 bg-gray-200" />}
            </div>
            <div className="flex-1 pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <CaseStatusBadge status={entry.status as CaseStatus} />
                <span className="text-xs text-gray-500">
                  {formatDateTime(entry.changed_at)}
                </span>
              </div>
              <div className="mt-1 text-xs text-gray-600">
                by{' '}
                <span className="font-medium text-gray-700">
                  {entry.changedBy.name}
                </span>
              </div>
              {entry.note && (
                <div className="mt-1.5 flex items-start gap-1.5 rounded-lg border border-blue-100 bg-blue-50/60 px-2.5 py-1.5">
                  <Info className="mt-0.5 h-3 w-3 shrink-0 text-blue-600" />
                  <span className="text-xs italic leading-relaxed text-blue-800">
                    {entry.note}
                  </span>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}