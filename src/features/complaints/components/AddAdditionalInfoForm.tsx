'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import {
  INFORMATION_TYPES,
  INFORMATION_TYPE_LABELS,
} from '../additional-info.types';
import type { InformationType } from '../additional-info.types';

export function AddAdditionalInfoForm({
  complaintId,
}: {
  complaintId: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [informationType, setInformationType] =
    useState<InformationType>('ADDITIONAL_DETAILS');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(
        `/api/complaints/${complaintId}/additional-info`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description, informationType }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to add');
        setLoading(false);
        return;
      }

      setTitle('');
      setDescription('');
      setInformationType('ADDITIONAL_DETAILS');
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
        Add Additional Information
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 space-y-3"
    >
      <h3 className="text-sm font-semibold text-gray-900">
        Add Additional Information
      </h3>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Brief summary"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Type <span className="text-red-500">*</span>
        </label>
        <select
          value={informationType}
          onChange={(e) =>
            setInformationType(e.target.value as InformationType)
          }
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
        >
          {(Object.keys(INFORMATION_TYPES) as InformationType[]).map((t) => (
            <option key={t} value={t}>
              {INFORMATION_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the additional information."
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