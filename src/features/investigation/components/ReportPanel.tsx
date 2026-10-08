'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Loader2 } from 'lucide-react';
import { formatDateTime } from '@/lib/date-format';
import type { InvestigationReportDTO } from '../types';

export function ReportPanel({
  caseId,
  report,
  canEdit,
}: {
  caseId: number;
  report: InvestigationReportDTO | null;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [findings, setFindings] = useState(report?.findings ?? '');
  const [recommendation, setRecommendation] = useState(
    report?.recommendation ?? ''
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/cases/${caseId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ findings, recommendation }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to save report');
        setLoading(false);
        return;
      }

      setEditing(false);
      setLoading(false);
      router.refresh();
    } catch {
      setError('Network error');
      setLoading(false);
    }
  }

  if (editing) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">
          {report ? 'Edit Investigation Report' : 'Create Investigation Report'}
        </h2>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-2 text-xs text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Findings <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={6}
            value={findings}
            onChange={(e) => setFindings(e.target.value)}
            placeholder="Summarize what you discovered during the investigation."
            className="w-full rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm text-gray-900 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
          />
          <p className="mt-1 text-xs text-gray-500">Minimum 20 characters.</p>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Recommendation <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={recommendation}
            onChange={(e) => setRecommendation(e.target.value)}
            placeholder="Recommend next steps: escalation, disciplinary action, policy change, or closure."
            className="w-full rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm text-gray-900 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
          />
          <p className="mt-1 text-xs text-gray-500">Minimum 10 characters.</p>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setEditing(false)}
            disabled={loading}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-blue-500/30 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Report'
            )}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">
          Investigation Report
        </h2>
        {canEdit && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-blue-500/30 transition hover:from-blue-700 hover:to-indigo-700"
          >
            {report ? (
              <>
                <Pencil className="h-3.5 w-3.5" />
                Edit Report
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                Write Report
              </>
            )}
          </button>
        )}
      </div>

      {!report ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white/50 p-8 text-center">
          <p className="text-sm text-gray-500">
            {canEdit
              ? 'No report has been written yet. Click "Write Report" to begin.'
              : 'No investigation report has been submitted yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
              Findings
            </h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
              {report.findings}
            </p>
          </div>
          <div>
            <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
              Recommendation
            </h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
              {report.recommendation}
            </p>
          </div>
          <p className="text-xs text-gray-400">
            Submitted {formatDateTime(report.createdAt)}
          </p>
        </div>
      )}
    </div>
  );
}