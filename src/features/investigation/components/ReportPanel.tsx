'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil } from 'lucide-react';
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

  // Show form
  if (editing) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">
          {report ? 'Edit Investigation Report' : 'Create Investigation Report'}
        </h2>

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-2 text-xs text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Findings <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={6}
            value={findings}
            onChange={(e) => setFindings(e.target.value)}
            placeholder="Summarize what you discovered during the investigation."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">Minimum 20 characters.</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Recommendation <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={recommendation}
            onChange={(e) => setRecommendation(e.target.value)}
            placeholder="Recommend next steps: escalation, disciplinary action, policy change, or closure."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">Minimum 10 characters.</p>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => setEditing(false)}
            disabled={loading}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? 'Saving...' : 'Save Report'}
          </button>
        </div>
      </form>
    );
  }

  // Show report (or empty state)
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
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition"
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
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <p className="text-sm text-gray-500">
            {canEdit
              ? 'No report has been written yet. Click "Write Report" to begin.'
              : 'No investigation report has been submitted yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Findings
            </h3>
            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
              {report.findings}
            </p>
          </div>
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Recommendation
            </h3>
            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
              {report.recommendation}
            </p>
          </div>
          <p className="text-xs text-gray-400">
            Submitted{' '}
            {new Date(report.createdAt).toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
        </div>
      )}
    </div>
  );
}