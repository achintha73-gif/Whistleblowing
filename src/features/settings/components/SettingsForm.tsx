'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X } from 'lucide-react';
import type { EditableSettings } from '../types';

export function SettingsForm({
  initialSettings,
}: {
  initialSettings: EditableSettings;
}) {
  const router = useRouter();
  const [siteName, setSiteName] = useState(initialSettings.siteName);
  const [supportEmail, setSupportEmail] = useState(
    initialSettings.supportEmail
  );
  const [maxUploadMb, setMaxUploadMb] = useState(
    String(initialSettings.maxUploadMb)
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const dirty =
    siteName !== initialSettings.siteName ||
    supportEmail !== initialSettings.supportEmail ||
    maxUploadMb !== String(initialSettings.maxUploadMb);

  function reset() {
    setSiteName(initialSettings.siteName);
    setSupportEmail(initialSettings.supportEmail);
    setMaxUploadMb(String(initialSettings.maxUploadMb));
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName,
          supportEmail,
          maxUploadMb: Number(maxUploadMb),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to save');
        setLoading(false);
        return;
      }

      setSaved(true);
      setLoading(false);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError('Network error');
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-gray-200 bg-white p-6 space-y-5"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">
          General Settings
        </h2>
        {saved && (
          <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md px-2 py-1">
            ✓ Saved
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Site Name
        </label>
        <input
          type="text"
          required
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-gray-500">
          Display name for the application (2-100 characters)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Support Email
        </label>
        <input
          type="email"
          required
          value={supportEmail}
          onChange={(e) => setSupportEmail(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-gray-500">
          Contact email shown to users
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Max File Upload (MB)
        </label>
        <input
          type="number"
          required
          min={1}
          max={100}
          value={maxUploadMb}
          onChange={(e) => setMaxUploadMb(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-gray-500">
          Maximum evidence file size (1-100 MB)
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
        <button
          type="button"
          onClick={reset}
          disabled={!dirty || loading}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <X className="h-4 w-4" />
          Reset
        </button>
        <button
          type="submit"
          disabled={!dirty || loading}
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400 transition"
        >
          <Save className="h-4 w-4" />
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
}