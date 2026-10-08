'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  UserCheck,
  AlertCircle,
  Check,
  Loader2,
  Users,
  Pencil,
  X,
} from 'lucide-react';

interface Investigator {
  user_id: number;
  name: string;
  email: string;
}

export function AssignInvestigatorDropdown({
  caseId,
  currentInvestigatorIds,
}: {
  caseId: number;
  currentInvestigatorIds: number[];
}) {
  const router = useRouter();
  const [investigators, setInvestigators] = useState<Investigator[]>([]);
  const [selected, setSelected] = useState<Set<number>>(
    new Set(currentInvestigatorIds)
  );
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(currentInvestigatorIds.length === 0);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/investigators')
      .then((r) => r.json())
      .then((data) => setInvestigators(data.investigators ?? []))
      .catch(() => setError('Failed to load investigators'))
      .finally(() => setLoadingList(false));
  }, []);

  useEffect(() => {
    setSelected(new Set(currentInvestigatorIds));
  }, [currentInvestigatorIds]);

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Search-filtered investigators
  const searchFiltered = useMemo(() => {
    if (!search.trim()) return investigators;
    const s = search.toLowerCase();
    return investigators.filter(
      (inv) =>
        inv.name.toLowerCase().includes(s) ||
        inv.email.toLowerCase().includes(s)
    );
  }, [investigators, search]);

  // Assigned investigators (from search-filtered set, in ID order)
  const assignedInvestigators = useMemo(
    () => searchFiltered.filter((inv) => selected.has(inv.user_id)),
    [searchFiltered, selected]
  );

  // Available (unselected) investigators
  const availableInvestigators = useMemo(
    () => searchFiltered.filter((inv) => !selected.has(inv.user_id)),
    [searchFiltered, selected]
  );

  const originalSet = useMemo(
    () => new Set(currentInvestigatorIds),
    [currentInvestigatorIds]
  );

  const hasChanged = useMemo(() => {
    if (selected.size !== originalSet.size) return true;
    for (const id of selected) {
      if (!originalSet.has(id)) return true;
    }
    return false;
  }, [selected, originalSet]);

  function startEditing() {
    setExpanded(true);
    setSearch('');
  }

  function cancelEdit() {
    setSelected(new Set(currentInvestigatorIds));
    setSearch('');
    setError(null);
    setExpanded(false);
  }

  async function handleSave() {
    setError(null);
    setLoading(true);
    setSaved(false);

    try {
      const res = await fetch(`/api/cases/${caseId}/investigators`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investigatorIds: Array.from(selected),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Update failed');
        return;
      }

      setSaved(true);
      setExpanded(false);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  const selectedCount = selected.size;

  // -------------------------------------------------------------
  // Collapsed view
  // -------------------------------------------------------------
  if (!expanded) {
    const currentAssigned = investigators.filter((inv) =>
      selected.has(inv.user_id)
    );
    return (
      <div className="rounded-2xl border border-white/60 bg-white/60 p-5 shadow-lg shadow-blue-900/5 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-900">
              Investigators
            </h3>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                selectedCount > 0
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600'
              }`}
            >
              {selectedCount} assigned
            </span>
          </div>
          <button
            type="button"
            onClick={startEditing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </button>
        </div>

        {saved && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
            <Check className="h-3.5 w-3.5" />
            Investigators updated successfully
          </div>
        )}

        {currentAssigned.length === 0 ? (
          <p className="mt-3 text-xs italic text-gray-500">
            No investigators assigned yet.
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {currentAssigned.map((inv) => (
              <div
                key={inv.user_id}
                className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-2.5 py-1.5"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 text-[10px] font-semibold text-white">
                  {inv.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-gray-900">
                  {inv.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // Expanded view
  // -------------------------------------------------------------
  return (
    <div className="rounded-2xl border border-white/60 bg-white/60 p-5 shadow-lg shadow-blue-900/5 backdrop-blur-xl">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-900">
            Assign Investigators
          </h3>
        </div>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
            selectedCount > 0
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-gray-200 bg-gray-50 text-gray-600'
          }`}
        >
          {selectedCount} assigned
        </span>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search investigators..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={loading || loadingList}
          className="w-full rounded-xl border border-gray-200 bg-white/70 py-2.5 pl-10 pr-3.5 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
        />
      </div>

      {loadingList ? (
        <div className="flex items-center justify-center gap-2 py-6 text-xs text-gray-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading investigators...
        </div>
      ) : searchFiltered.length === 0 ? (
        <div className="py-6 text-center text-xs text-gray-500">
          No investigators found
        </div>
      ) : (
        <div className="scrollbar-hide max-h-80 space-y-3 overflow-y-auto">
          {/* Assigned section */}
          {assignedInvestigators.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2 px-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                  Assigned
                </span>
                <span className="text-[10px] font-medium text-gray-400">
                  {assignedInvestigators.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {assignedInvestigators.map((inv) => (
                  <button
                    key={inv.user_id}
                    type="button"
                    onClick={() => toggle(inv.user_id)}
                    disabled={loading}
                    className="group inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    title={`Remove ${inv.name}`}
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 text-[10px] font-semibold text-white">
                      {inv.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-gray-900">
                      {inv.name}
                    </span>
                    <X className="h-3 w-3 text-gray-400 transition group-hover:text-red-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Available section */}
          {availableInvestigators.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2 px-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  Available
                </span>
                <span className="text-[10px] font-medium text-gray-400">
                  {availableInvestigators.length}
                </span>
              </div>
              <ul className="overflow-hidden rounded-xl border border-white/60 bg-white/50 backdrop-blur-sm">
                {availableInvestigators.map((inv) => (
                  <li
                    key={inv.user_id}
                    className="border-b border-white/60 last:border-b-0"
                  >
                    <button
                      type="button"
                      onClick={() => toggle(inv.user_id)}
                      disabled={loading}
                      className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition hover:bg-blue-50/60 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-xs font-semibold text-gray-500">
                        {inv.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-gray-900">
                          {inv.name}
                        </div>
                        <div className="truncate text-xs text-gray-500">
                          {inv.email}
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 opacity-0 transition group-hover:opacity-100">
                        + add
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading || !hasChanged}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <UserCheck className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
        <button
          type="button"
          onClick={cancelEdit}
          disabled={loading}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <X className="h-3.5 w-3.5" />
          Cancel
        </button>
      </div>

      <p className="mt-2.5 text-[11px] text-gray-500">
        {hasChanged
          ? 'Click "Save Changes" to apply your selection.'
          : 'Click a chip to remove, or click an available investigator to add.'}
      </p>
    </div>
  );
}