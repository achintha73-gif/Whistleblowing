'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, AlertTriangle } from 'lucide-react';

const CATEGORIES = [
  'Financial Fraud',
  'Harassment',
  'Data Protection',
  'Conflict of Interest',
  'Discrimination',
  'Safety Violation',
  'Retaliation',
  'Environmental',
  'Other',
];

export function AnonymousComplaintForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (title.trim().length < 5) {
      setError('Title must be at least 5 characters long');
      return;
    }
    if (description.trim().length < 20) {
      setError('Description must be at least 20 characters long');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/anonymous/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category: category || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to submit complaint');
        setLoading(false);
        return;
      }

      router.push(
        `/anonymous/success?code=${encodeURIComponent(data.referenceCode)}`
      );
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
            <Shield className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-blue-900">
              Anonymous Submission
            </h2>
            <p className="mt-1 text-xs text-blue-800">
              Your identity will not be recorded. After submitting, you will
              receive a reference code to track your complaint.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Brief summary of the issue"
        />
        <p className="mt-1 text-xs text-gray-500">
          {title.length}/200 characters
        </p>
      </div>

      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Select a category (optional)</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          required
          rows={8}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Provide details about what happened, when, where, and any other relevant information. Avoid including details that could identify you."
        />
        <p className="mt-1 text-xs text-gray-500">
          {description.length} characters (minimum 20)
        </p>
      </div>

      <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
          <p className="text-xs text-amber-800">
            <strong>Important:</strong> Save your reference code after
            submitting. You&apos;ll need it to track your complaint status or
            add additional information later.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition"
      >
        {loading ? 'Submitting...' : 'Submit Complaint Anonymously'}
      </button>
    </form>
  );
}
