'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Lock,
  AlertTriangle,
  Info,
  Send,
  ShieldCheck,
  EyeOff,
} from 'lucide-react';
import { COMPLAINT_CATEGORIES } from '../types';

type TabType = 'details' | 'anonymous';

export function SubmitComplaintForm() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (title.trim().length < 5) {
      setError('Title must be at least 5 characters long');
      setActiveTab('details');
      return;
    }
    if (description.trim().length < 20) {
      setError('Description must be at least 20 characters long');
      setActiveTab('details');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category: category || null,
          isAnonymous,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to submit complaint');
        setLoading(false);
        return;
      }

      router.push(`/dashboard/complaints/${data.complaint.complaintId}`);
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-1 rounded-xl bg-gray-100/80 p-1 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
            activeTab === 'details'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="h-4 w-4" />
          Details
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('anonymous')}
          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
            activeTab === 'anonymous'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Lock className="h-4 w-4" />
          Anonymous
          {isAnonymous && (
            <span className="h-2 w-2 rounded-full bg-green-500" />
          )}
        </button>
      </div>

      {activeTab === 'details' && (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="mb-1.5 block text-sm font-medium text-gray-700"
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
              className="w-full rounded-xl border border-gray-300 bg-white/80 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 backdrop-blur-sm transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Brief summary of your concern"
            />
            <p className="mt-1.5 text-xs text-gray-500">
              {title.length}/200 characters · minimum 5
            </p>
          </div>

          <div>
            <label
              htmlFor="category"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white/80 px-3.5 py-2.5 text-sm text-gray-900 backdrop-blur-sm transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Select a category (optional)</option>
              {COMPLAINT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              required
              rows={8}
              maxLength={5000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white/80 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 backdrop-blur-sm transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Describe the situation in detail. Include dates, people involved, and any relevant information."
            />
            <p className="mt-1.5 text-xs text-gray-500">
              {description.length}/5000 characters · minimum 20
            </p>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 backdrop-blur-sm">
            <Info className="h-4 w-4 mt-0.5 shrink-0 text-blue-600" />
            <p className="text-xs text-blue-800">
              Be as detailed and specific as possible. Include dates, times,
              locations, and people involved to help us investigate effectively.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'anonymous' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600/10">
                <EyeOff className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-blue-900">
                  Anonymous Submission
                </h3>
                <p className="mt-1 text-xs text-blue-800 leading-relaxed">
                  Your name and email will not be linked to this complaint.
                  Your identity will be completely hidden from everyone in the
                  system.
                </p>
              </div>
            </div>
          </div>

          <div
            className={`rounded-xl border-2 p-5 transition-all ${
              isAnonymous
                ? 'border-green-400 bg-green-50/70'
                : 'border-gray-200 bg-white/60'
            }`}
          >
            <label className="flex cursor-pointer items-start gap-4">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="peer sr-only"
                />
                <div
                  className={`h-6 w-11 rounded-full transition-colors ${
                    isAnonymous ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`mt-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      isAnonymous ? 'translate-x-5.5 ml-5' : 'ml-0.5'
                    }`}
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    className={`h-4 w-4 ${
                      isAnonymous ? 'text-green-600' : 'text-gray-400'
                    }`}
                  />
                  <span className="text-sm font-semibold text-gray-900">
                    {isAnonymous
                      ? 'Anonymous mode is ON'
                      : 'Submit anonymously'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  {isAnonymous
                    ? 'Your complaint will be submitted without any identifying information.'
                    : 'Toggle this on to hide your identity completely.'}
                </p>
              </div>
            </label>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2.5 rounded-xl border border-green-200 bg-green-50/70 p-3.5">
              <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0 text-green-600" />
              <p className="text-xs text-green-800">
                <strong>Protected:</strong> Anonymous complaints cannot be
                traced back to you.
              </p>
            </div>
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
              <p className="text-xs text-amber-800">
                <strong>Note:</strong> If you submit anonymously, you will not
                be able to track this complaint&apos;s status later. Only use
                anonymous mode if you&apos;re comfortable with this.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-md disabled:from-blue-400 disabled:to-indigo-400 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
          {loading ? 'Submitting...' : 'Submit Complaint'}
        </button>
      </div>
    </form>
  );
}