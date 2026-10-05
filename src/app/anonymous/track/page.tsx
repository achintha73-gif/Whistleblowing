'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, ArrowLeft, AlertTriangle } from 'lucide-react';

function TrackForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = code.trim().toUpperCase();
    if (trimmed.length < 5) {
      setError('Please enter a valid reference code');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/anonymous/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Complaint not found');
        setLoading(false);
        return;
      }

      router.push(`/anonymous/track/${encodeURIComponent(trimmed)}`);
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label
          htmlFor="code"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Reference Code
        </label>
        <input
          id="code"
          type="text"
          required
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="WB-2026-XXXXXX"
          className="w-full rounded-md border border-gray-300 px-3 py-2.5 font-mono text-lg text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          Format: WB-YYYY-XXXXXX (e.g., WB-2026-A7X9K2)
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition inline-flex items-center justify-center gap-2"
      >
        <Search className="h-4 w-4" />
        {loading ? 'Searching...' : 'Track Complaint'}
      </button>
    </form>
  );
}

export default function TrackComplaintPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-md">
        <Link
          href="/login"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Track Your Complaint
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Enter your reference code to view your anonymous complaint.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <Suspense fallback={<div className="text-sm text-gray-500">Loading...</div>}>
            <TrackForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          Lost your reference code? Unfortunately, we cannot recover it since
          your complaint is anonymous.
        </p>
      </div>
    </div>
  );
}
