'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Investigator {
  user_id: number;
  name: string;
  email: string;
}

export function AssignInvestigatorDropdown({
  caseId,
  currentInvestigatorId,
}: {
  caseId: number;
  currentInvestigatorId: number | null;
}) {
  const router = useRouter();
  const [investigators, setInvestigators] = useState<Investigator[]>([]);
  const [selected, setSelected] = useState<number | ''>(
    currentInvestigatorId ?? ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/investigators')
      .then((r) => r.json())
      .then((data) => setInvestigators(data.investigators ?? []))
      .catch(() => setError('Failed to load investigators'));
  }, []);

  async function handleAssign() {
    if (!selected) {
      setError('Please select an investigator');
      return;
    }
    setError(null);
    setLoading(true);
    setSaved(false);

    try {
      const res = await fetch(`/api/cases/${caseId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ investigatorId: selected }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Assignment failed');
        setLoading(false);
        return;
      }

      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Assign Investigator
      </label>

      {error && (
        <div className="mb-2 text-xs text-red-600">{error}</div>
      )}
      {saved && (
        <div className="mb-2 text-xs text-green-600">Saved!</div>
      )}

      <div className="flex gap-2">
        <select
          value={selected}
          onChange={(e) =>
            setSelected(e.target.value ? Number(e.target.value) : '')
          }
          disabled={loading}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
        >
          <option value="">Select investigator...</option>
          {investigators.map((inv) => (
            <option key={inv.user_id} value={inv.user_id}>
              {inv.name} ({inv.email})
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleAssign}
          disabled={loading || !selected}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400 transition"
        >
          {loading ? 'Saving...' : 'Assign'}
        </button>
      </div>
    </div>
  );
}