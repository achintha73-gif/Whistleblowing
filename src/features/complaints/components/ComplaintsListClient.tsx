'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
  Inbox,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { ComplaintCard } from './ComplaintCard';
import { COMPLAINT_CATEGORIES } from '../types';
import type { ComplaintSummary } from '../types';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CONVERTED_TO_CASE', label: 'Converted to Case' },
];

const PAGE_SIZE_OPTIONS = [5, 10, 15, 25, 50];

export function ComplaintsListClient({
  complaints,
  showCreateCaseAction,
}: {
  complaints: ComplaintSummary[];
  showCreateCaseAction: boolean;
}) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      if (search) {
        const s = search.toLowerCase();
        if (!c.title.toLowerCase().includes(s)) {
          return false;
        }
      }
      if (category && c.category !== category) return false;
      if (status && c.status !== status) return false;
      return true;
    });
  }, [complaints, search, category, status]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, status, pageSize]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const paginated = filtered.slice(startIdx, endIdx);

  const hasFilters = !!(search || category || status);

  function clearFilters() {
    setSearch('');
    setCategory('');
    setStatus('');
  }

  // Generate page numbers (with ellipsis for many pages)
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
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white/70 py-2.5 pl-10 pr-3.5 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white/70 px-3.5 py-2.5 text-sm text-gray-900 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 lg:w-48"
          >
            <option value="">All categories</option>
            {COMPLAINT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white/70 px-3.5 py-2.5 text-sm text-gray-900 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 lg:w-44"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

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

        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Showing{' '}
          <span className="font-semibold text-gray-700">
            {filtered.length === 0 ? 0 : startIdx + 1}-
            {Math.min(endIdx, filtered.length)}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-gray-700">{filtered.length}</span>{' '}
          concern{filtered.length === 1 ? '' : 's'}
          {hasFilters && ' (filtered)'}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-gray-300 bg-white/60 p-12 text-center backdrop-blur-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Inbox className="h-7 w-7" />
          </div>
          <p className="mt-3 text-sm font-semibold text-gray-900">
            {hasFilters ? 'No matching concerns' : 'No concerns yet'}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {hasFilters
              ? 'Try changing your search or filters.'
              : 'Concerns you submit will appear here.'}
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
            {paginated.map((complaint) => (
              <ComplaintCard
                key={complaint.complaintId}
                complaint={complaint}
                showCreateCaseAction={showCreateCaseAction}
              />
            ))}
          </div>

          {/* Pagination */}
          {filtered.length > pageSize && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/60 p-3 shadow-lg shadow-blue-900/5 backdrop-blur-xl sm:p-4">
              {/* Rows per page */}
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

              {/* Page controls */}
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

                {/* Page numbers */}
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