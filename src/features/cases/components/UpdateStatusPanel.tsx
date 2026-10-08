'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  Check,
  AlertCircle,
  FolderOpen,
  Search,
  ClipboardCheck,
  CheckCircle2,
  Archive,
  RefreshCw,
} from 'lucide-react';
import { CASE_STATUS, CASE_STATUS_LABELS } from '../types';
import type { CaseStatus } from '../types';
import type { RoleName } from '@/features/auth/types';

const STATUS_ICONS: Record<
  CaseStatus,
  React.ComponentType<{ className?: string }>
> = {
  OPEN: FolderOpen,
  INVESTIGATING: Search,
  PENDING_REVIEW: ClipboardCheck,
  CLOSED: CheckCircle2,
  ARCHIVED: Archive,
};

const STATUS_COLORS: Record<CaseStatus, string> = {
  OPEN: 'border-sky-200 bg-sky-50 text-sky-700 hover:border-sky-400 hover:bg-sky-100',
  INVESTIGATING:
    'border-violet-200 bg-violet-50 text-violet-700 hover:border-violet-400 hover:bg-violet-100',
  PENDING_REVIEW:
    'border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-400 hover:bg-amber-100',
  CLOSED:
    'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-100',
  ARCHIVED:
    'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-400 hover:bg-slate-100',
};

export function UpdateStatusPanel({
  caseId,
  currentStatus,
  viewerRole,
}: {
  caseId: number;
  currentStatus: CaseStatus;
  viewerRole: RoleName;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<CaseStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function updateStatus(newStatus: CaseStatus) {
    if (newStatus === currentStatus) return;
    setError(null);
    setLoading(newStatus);
    setSaved(false);

    try {
      const res = await fetch(`/api/cases/${caseId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Update failed');
        return;
      }

      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError('Network error');
    } finally {
      setLoading(null);
    }
  }

  const allStatuses = Object.keys(CASE_STATUS) as CaseStatus[];

  // Managers can't set "INVESTIGATING" — that's the investigator's action.
  // Investigators still see it.
  const available = allStatuses.filter((s) => {
    if (s === currentStatus) return false;
    if (viewerRole === 'MANAGER' && s === 'INVESTIGATING') return false;
    return true;
  });

  const CurrentIcon = STATUS_ICONS[currentStatus];

  return (
    <div className="rounded-2xl border border-white/60 bg-white/60 p-5 shadow-lg shadow-blue-900/5 backdrop-blur-xl">
      {/* Header with current status */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-900">
            Update Status
          </h3>
        </div>

        {/* Current status pill */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-[11px] font-medium text-gray-700 backdrop-blur-sm">
          <span className="text-gray-500">Current:</span>
          <CurrentIcon className="h-3 w-3" />
          <span className="font-semibold text-gray-900">
            {CASE_STATUS_LABELS[currentStatus]}
          </span>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {saved && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
          <Check className="h-3.5 w-3.5" />
          Status updated successfully
        </div>
      )}

      {/* Status buttons */}
      {available.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-300 bg-white/40 px-3 py-4 text-center text-xs text-gray-500">
          No status changes available for your role.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {available.map((status) => {
            const Icon = STATUS_ICONS[status];
            const isUpdating = loading === status;
            const isDisabled = loading !== null;

            return (
              <button
                key={status}
                type="button"
                onClick={() => updateStatus(status)}
                disabled={isDisabled}
                className={`group inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${STATUS_COLORS[status]} disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {isUpdating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
                {CASE_STATUS_LABELS[status]}
              </button>
            );
          })}
        </div>
      )}

      <p className="mt-3 text-[11px] text-gray-500">
        Status changes are logged in the case history.
      </p>
    </div>
  );
}