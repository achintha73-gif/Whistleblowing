'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CASE_STATUS, CASE_STATUS_LABELS } from '../types';
import type { CaseStatus } from '../types';

export function UpdateStatusPanel({
  caseId,
  currentStatus,
}: {
  caseId: number;
  currentStatus: CaseStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function updateStatus(newStatus: CaseStatus) {
    if (newStatus === currentStatus) return;
    setError(null);
    setLoading(true);
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
        setLoading(false);
        return;
      }

      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  // Get possible transitions (excluding current status)
  const allStatuses = Object.keys(CASE_STATUS) as CaseStatus[];
  const available = allStatuses.filter((s) => s !== currentStatus);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">
        Update Status
      </h3>

      {error && <div className="mb-2 text-xs text-red-600">{error}</div>}
      {saved && <div className="mb-2 text-xs text-green-600">Updated!</div>}

      <div className="flex flex-wrap gap-2">
        {available.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => updateStatus(status)}
            disabled={loading}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-blue-400 disabled:opacity-50 transition"
          >
            {CASE_STATUS_LABELS[status]}
          </button>
        ))}
      </div>
    </div>
  );
}