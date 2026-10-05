'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search, AlertCircle } from 'lucide-react';

function formatCodeInput(value: string): string {
  // Strip non-alphanumeric, uppercase
  const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '');

  // If starts with WB, strip it for the middle formatting then re-add
  let rest = clean;
  if (rest.startsWith('WB')) {
    rest = rest.slice(2);
  }

  // Limit to 8 chars after WB
  rest = rest.slice(0, 8);

  if (rest.length === 0) return '';

  if (rest.length <= 4) {
    return `WB-${rest}`;
  }
  return `WB-${rest.slice(0, 4)}-${rest.slice(4)}`;
}

export function TrackCodeForm() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(value: string) {
    const formatted = formatCodeInput(value);
    setCode(formatted);
    setError(null);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    // Validate format
    const pattern = /^WB-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/;
    if (!pattern.test(code)) {
      setError('Please enter a valid reference code (format: WB-XXXX-XXXX)');
      return;
    }

    setLoading(true);
    router.push(`/track/${encodeURIComponent(code)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
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
          onChange={(e) => handleChange(e.target.value)}
          placeholder="WB-XXXX-XXXX"
          maxLength={13}
          autoFocus
          className="w-full rounded-md border border-gray-300 px-3 py-3 text-center font-mono text-lg font-bold tracking-widest text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500 text-center">
          Case-insensitive. Format: WB-XXXX-XXXX
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || code.length < 13}
        className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition"
      >
        <Search className="h-4 w-4" />
        {loading ? 'Searching...' : 'Track Complaint'}
      </button>
    </form>
  );
}