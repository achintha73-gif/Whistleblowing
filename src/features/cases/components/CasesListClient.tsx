'use client';

import { useState, useMemo } from 'react';
import { Search, X, SlidersHorizontal, Briefcase } from 'lucide-react';
import { CaseCard } from './CaseCard';
import {
  CASE_STATUS,
  CASE_PRIORITY,
  CASE_STATUS_LABELS,
  CASE_PRIORITY_LABELS,
} from '../types';
import type { CaseSummary, CaseStatus, CasePriority } from '../types';

export function CasesListClient({
  cases,
  isManager,
}: {
  cases: CaseSummary[];
  isManager: boolean;
}) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  const filtered = useMemo(() => {
    return cases.filter((c) => {
      if (search) {
        const s = search.toLowerCase();
        const matchesTitle = c.complaintTitle.toLowerCase().includes(s);
        const matchesId = String(c.caseId).includes(s);
        const matchesComplaintId = String(c.complaintId).includes(s);
        if (!matchesTitle && !matchesId && !matchesComplaintId) return false;
      }
      if (status && c.status !== status) return false;
      if (priority && c.priority !== priority) return false;
      return true;
    });
  }, [cases, search, status, priority]);

  const hasFilters = !!(search || status || priority);

  function clearFilters() {
    setSearch('');
    setStatus('');
    setPriority('');
  }

  return (
    <div className="space-y-5">
      {/* Filters bar — glass */}
      <div className="rounded-2xl border border-white/60 bg-white/60 p-3 shadow-lg shadow-blue-900/5 backdrop-blur-xl sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by case ID or complaint title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white/70 py-2.5 pl-10 pr-3.5 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          {/* Status */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white/70 px-3.5 py-2.5 text-sm text-gray-900 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 lg:w-48"
          >
            <option value="">All statuses</option>
            {(Object.keys(CASE_STATUS) as CaseStatus[]).map((s) => (
              <option key={s} value={s}>
                {CASE_STATUS_LABELS[s]}
              </option>
            ))}
          </select>

          {/* Priority */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white/70 px-3.5 py-2.5 text-sm text-gray-900 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 lg:w-44"
          >
            <option value="">All priorities</option>
            {(Object.keys(CASE_PRIORITY) as CasePriority[]).map((p) => (
              <option key={p} value={p}>
                {CASE_PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>

          {/* Clear */}
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white/70 px-3.5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-white hover:text-gray-900"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>

        {/* Result count */}
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Showing <span className="font-semibold text-gray-700">{filtered.length}</span> of{' '}
          <span className="font-semibold text-gray-700">{cases.length}</span>{' '}
          case{cases.length === 1 ? '' : 's'}
          {hasFilters && ' (filtered)'}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-gray-300 bg-white/60 p-12 text-center backdrop-blur-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Briefcase className="h-7 w-7" />
          </div>
          <p className="mt-3 text-sm font-semibold text-gray-900">
            {hasFilters ? 'No matching cases' : 'No cases yet'}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {hasFilters
              ? 'Try changing your search or filters.'
              : isManager
              ? 'Create a case from a complaint to get started.'
              : 'Assigned cases will appear here.'}
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((caseItem) => (
            <CaseCard key={caseItem.caseId} caseItem={caseItem} />
          ))}
        </div>
      )}
    </div>
  );
}