'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { CaseCard } from './CaseCard';
import {
  CASE_STATUS,
  CASE_PRIORITY,
  CASE_STATUS_LABELS,
  CASE_PRIORITY_LABELS,
} from '../types';
import type { CaseSummary, CaseStatus, CasePriority } from '../types';

const PAGE_SIZE_OPTIONS = [10, 15, 25, 50];

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
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

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

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, status, priority, pageSize]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const paginated = filtered.slice(startIdx, endIdx);

  const hasFilters = !!(search || status || priority);

  function clearFilters() {
    setSearch('');
    setStatus('');
    setPriority('');
  }

  function getPageNumbers(): (number | 'ellipsis')[] {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    const left = Math.max(2, safePage - 1);
    const right = Math.min(totalPages - 1, safePage + 1);

    if (left > 2) pages.push('ellipsis');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push('ellipsis');

    pages.push(totalPages);
    return pages;
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
              placeholder="Search by case ID or concern title..."
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
          Showing{' '}
          <span className="font-semibold text-gray-700">
            {filtered.length === 0 ? 0 : startIdx + 1}-
            {Math.min(endIdx, filtered.length)}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-gray-700">{filtered.length}</span>{' '}
          case{filtered.length === 1 ? '' : 's'}
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
              ? 'Create a case from a concern to get started.'
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
        <>
          <div className="space-y-3">
            {paginated.map((caseItem) => (
              <CaseCard key={caseItem.caseId} caseItem={caseItem} />
            ))}
          </div>

          {/* Pagination */}
          {filtered.length > pageSize && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/60 p-3 shadow-lg shadow-blue-900/5 backdrop-blur-xl sm:p-4">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="rounded-lg border border-gray-200 bg-white/70 px-2 py-1 text-xs text-gray-900 transition focus:border-blue-500 focus:bg-white focus:outline-none"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={safePage <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white/70 text-gray-600 transition hover:bg-white hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="First page"
                >
                  <ChevronsLeft className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className="flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white/70 px-2.5 text-xs font-medium text-gray-600 transition hover:bg-white hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Prev
                </button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((p, idx) =>
                    p === 'ellipsis' ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="flex h-8 w-8 items-center justify-center text-xs text-gray-400"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setCurrentPage(p)}
                        className={`flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-xs font-medium transition ${
                          safePage === p
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                            : 'border border-gray-200 bg-white/70 text-gray-600 hover:bg-white hover:text-gray-900'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={safePage >= totalPages}
                  className="flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white/70 px-2.5 text-xs font-medium text-gray-600 transition hover:bg-white hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safePage >= totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white/70 text-gray-600 transition hover:bg-white hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Last page"
                >
                  <ChevronsRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}