'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CASE_PRIORITY, CASE_PRIORITY_LABELS } from '../types';
import type { CasePriority } from '../types';

export function CreateCaseButton({ complaintId }: { complaintId: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [priority, setPriority] = useState<CasePriority>('MEDIUM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaintId, priority }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create case');
        setLoading(false);
        return;
      }

      // Redirect to the new case detail page
      router.push(`/dashboard/cases/${data.caseDetail.caseId}`);
      router.refresh();
    } catch {
      setError('Network error');
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition"
      >
        Create Case
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {error && (
        <div className="text-xs text-red-600 max-w-xs text-right">{error}</div>
      )}
      <div className="flex items-center gap-2">
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as CasePriority)}
          disabled={loading}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
        >
          {(Object.keys(CASE_PRIORITY) as CasePriority[]).map((p) => (
            <option key={p} value={p}>
              {CASE_PRIORITY_LABELS[p]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleCreate}
          disabled={loading}
          className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:bg-green-400 transition"
        >
          {loading ? 'Creating...' : 'Confirm'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={loading}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}