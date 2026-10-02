'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { EVIDENCE_TYPES } from '../types';
import { Plus } from 'lucide-react';

export function AddEvidenceForm({ caseId }: { caseId: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<string>('Document');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/cases/${caseId}/evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: fileName.trim(),
          fileType,
          description: description.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to add evidence');
        setLoading(false);
        return;
      }

      setFileName('');
      setFileType('Document');
      setDescription('');
      setOpen(false);
      setLoading(false);
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
        className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
      >
        <Plus className="h-4 w-4" />
        Add Evidence
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 space-y-3"
    >
      <h3 className="text-sm font-semibold text-gray-900">Add Evidence</h3>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          File name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder="e.g., Q3-financial-report.pdf"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          File type <span className="text-red-500">*</span>
        </label>
        <select
          value={fileType}
          onChange={(e) => setFileType(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
        >
          {EVIDENCE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what this evidence contains and why it matters."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => setOpen(false)}
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
          {loading ? 'Adding...' : 'Add'}
        </button>
      </div>
    </form>
  );
}