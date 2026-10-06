'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  X,
  FileText,
  FolderOpen,
  RefreshCw,
  UserCheck,
  Paperclip,
  ClipboardList,
  Info,
  User as UserIcon,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { LogEntry, LogEventType } from '../types';
import { LOG_EVENT_LABELS } from '../types';

const TYPE_META: Record<
  LogEventType,
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  COMPLAINT_SUBMITTED: {
    icon: FileText,
    color: 'bg-blue-100 text-blue-700',
  },
  CASE_CREATED: {
    icon: FolderOpen,
    color: 'bg-purple-100 text-purple-700',
  },
  CASE_STATUS_CHANGED: {
    icon: RefreshCw,
    color: 'bg-amber-100 text-amber-700',
  },
  INVESTIGATOR_ASSIGNED: {
    icon: UserCheck,
    color: 'bg-teal-100 text-teal-700',
  },
  EVIDENCE_ADDED: {
    icon: Paperclip,
    color: 'bg-green-100 text-green-700',
  },
  REPORT_SUBMITTED: {
    icon: ClipboardList,
    color: 'bg-rose-100 text-rose-700',
  },
  ADDITIONAL_INFO_SUBMITTED: {
    icon: Info,
    color: 'bg-sky-100 text-sky-700',
  },
  USER_CREATED: {
    icon: UserIcon,
    color: 'bg-slate-100 text-slate-700',
  },
};

const FILTER_ORDER: LogEventType[] = [
  'COMPLAINT_SUBMITTED',
  'CASE_CREATED',
  'CASE_STATUS_CHANGED',
  'EVIDENCE_ADDED',
  'REPORT_SUBMITTED',
  'ADDITIONAL_INFO_SUBMITTED',
  'USER_CREATED',
];

function formatDateTime(date: Date): string {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function ActivityLogTable({ entries }: { entries: LogEntry[] }) {
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<LogEventType>>(
    new Set()
  );
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (activeFilters.size > 0 && !activeFilters.has(e.type)) return false;
      if (search) {
        const s = search.toLowerCase();
        if (
          !e.description.toLowerCase().includes(s) &&
          !(e.actorName ?? '').toLowerCase().includes(s) &&
          !(e.entityRef ?? '').toLowerCase().includes(s)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [entries, search, activeFilters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const paginated = filtered.slice(startIdx, endIdx);

  function toggleFilter(type: LogEventType) {
    const next = new Set(activeFilters);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    setActiveFilters(next);
    setCurrentPage(1);
  }

  function clearAll() {
    setSearch('');
    setActiveFilters(new Set());
    setCurrentPage(1);
  }

  const hasFilters = search !== '' || activeFilters.size > 0;

  return (
    <div className="space-y-4">
      {/* Toolbar — glass */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/60 bg-white/60 p-4 shadow-lg shadow-blue-900/5 backdrop-blur-xl">
        {/* Search + Clear */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search activity..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-gray-200 bg-white/70 py-2.5 pl-10 pr-3.5 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white/70 px-3.5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-white hover:text-gray-900"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Filter:
          </span>
          {FILTER_ORDER.map((type) => {
            const active = activeFilters.has(type);
            const meta = TYPE_META[type];
            const Icon = meta.icon;
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleFilter(type)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
                  active
                    ? 'border-blue-500 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                    : 'border-gray-200 bg-white/70 text-gray-600 hover:bg-white hover:text-gray-900'
                }`}
              >
                <Icon className="h-3 w-3" />
                {LOG_EVENT_LABELS[type]}
                {active && <X className="h-3 w-3" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table — glass */}
      <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/60 shadow-lg shadow-blue-900/5 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-white/60 bg-white/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Date and Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Actor
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Event
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  &nbsp;
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/50">
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-sm text-gray-500"
                  >
                    No activity matches your filters.
                  </td>
                </tr>
              ) : (
                paginated.map((entry) => {
                  const meta = TYPE_META[entry.type];
                  const Icon = meta.icon;
                  return (
                    <tr
                      key={entry.id}
                      className="group transition hover:bg-white/60"
                    >
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {formatDateTime(entry.timestamp)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${meta.color} transition-transform group-hover:scale-110`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-xs font-medium text-gray-700">
                            {LOG_EVENT_LABELS[entry.type]}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {entry.actorName ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {entry.actorName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {entry.actorRole ?? ''}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm italic text-gray-400">
                            Anonymous
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-700">
                          {entry.description}
                        </div>
                        {entry.entityRef && (
                          <div className="text-xs text-gray-400 mt-0.5">
                            {entry.entityRef}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {entry.linkTo ? (
                          <Link
                            href={entry.linkTo}
                            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 transition hover:text-blue-800"
                          >
                            View
                            <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                          </Link>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination — glass */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/60 bg-white/40 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-xl border border-gray-200 bg-white/70 px-2.5 py-1.5 text-sm text-gray-900 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span>
              {filtered.length === 0
                ? '0 of 0'
                : `${startIdx + 1}-${Math.min(
                    endIdx,
                    filtered.length
                  )} of ${filtered.length}`}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="rounded-xl border border-gray-200 bg-white/70 p-2 text-gray-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={safePage >= totalPages}
                className="rounded-xl border border-gray-200 bg-white/70 p-2 text-gray-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}