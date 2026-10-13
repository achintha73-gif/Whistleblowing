'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import type { UserListItem } from '../types';
import { ROLE_BADGE_STYLES, STATUS_BADGE_STYLES } from '../badge-styles';
import { UserActionsMenu } from './UserActionsMenu';

const PAGE_SIZE_OPTIONS = [10, 15, 25, 50];

export function UserListTable({ users }: { users: UserListItem[] }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (search) {
        const s = search.toLowerCase();
        if (
          !u.name.toLowerCase().includes(s) &&
          !u.email.toLowerCase().includes(s)
        ) {
          return false;
        }
      }
      if (roleFilter && u.roleName !== roleFilter) return false;
      if (statusFilter && u.status !== statusFilter) return false;
      return true;
    });
  }, [users, search, roleFilter, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const paginated = filtered.slice(startIdx, endIdx);

  function clearFilters() {
    setSearch('');
    setRoleFilter('');
    setStatusFilter('');
  }

  const hasFilters = !!(search || roleFilter || statusFilter);

  function getPageNumbers(): (number | 'ellipsis')[] {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
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
      {/* Filters — glass */}
      <div className="rounded-2xl border border-white/60 bg-white/60 p-3 shadow-lg shadow-blue-900/5 backdrop-blur-xl sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white/70 py-2.5 pl-10 pr-3.5 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white/70 px-3.5 py-2.5 text-sm text-gray-900 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 lg:w-44"
          >
            <option value="">All roles</option>
            <option value="ADMIN">Administrator</option>
            <option value="MANAGER">Manager</option>
            <option value="INVESTIGATOR">Investigator</option>
            <option value="USER">Employee</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white/70 px-3.5 py-2.5 text-sm text-gray-900 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 lg:w-44"
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
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
          user{filtered.length === 1 ? '' : 's'}
          {hasFilters && ' (filtered)'}
        </div>
      </div>

      {/* Table — glass */}
      <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/60 shadow-lg shadow-blue-900/5 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-white/60 bg-white/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Department
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Joined
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="mx-auto flex flex-col items-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <UserCircle className="h-7 w-7" />
                      </div>
                      <p className="mt-3 text-sm font-semibold text-gray-900">
                        No users match your filters
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Try changing your search or filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((u) => (
                  <tr
                    key={u.userId}
                    className="group transition hover:bg-white/60"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-semibold text-white shadow-md shadow-blue-500/20">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-gray-900">
                            {u.name}
                          </div>
                          <div className="truncate text-xs text-gray-500">
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${ROLE_BADGE_STYLES[u.roleName]}`}
                      >
                        {u.roleName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {u.departmentName ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_BADGE_STYLES[u.status]}`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <UserActionsMenu user={u} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > pageSize && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/60 bg-white/40 px-4 py-3">
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
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white/70 text-gray-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="First page"
              >
                <ChevronsLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white/70 px-2.5 text-xs font-medium text-gray-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Prev
              </button>

              {getPageNumbers().map((p, idx) =>
                p === 'ellipsis' ? (
                  <span
                    key={`e-${idx}`}
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
                        : 'border border-gray-200 bg-white/70 text-gray-600 hover:bg-white'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={safePage >= totalPages}
                className="flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white/70 px-2.5 text-xs font-medium text-gray-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={safePage >= totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white/70 text-gray-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Last page"
              >
                <ChevronsRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}