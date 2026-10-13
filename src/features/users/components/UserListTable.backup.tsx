'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, SlidersHorizontal, UserCircle } from 'lucide-react';
import { formatDate } from '@/lib/date-format';
import type { UserListItem } from '../types';
import { ROLE_BADGE_STYLES, STATUS_BADGE_STYLES } from '../badge-styles';
import { UserActionsMenu } from './UserActionsMenu';

export function UserListTable({ users }: { users: UserListItem[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

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

  function clearFilters() {
    setSearch('');
    setRoleFilter('');
    setStatusFilter('');
  }

  const hasFilters = !!(search || roleFilter || statusFilter);

  return (
    <div className="space-y-5">
      {/* Filters — glass */}
      <div className="rounded-2xl border border-white/60 bg-white/60 p-3 shadow-lg shadow-blue-900/5 backdrop-blur-xl sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Search */}
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

          {/* Role */}
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

          {/* Status */}
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
          <span className="font-semibold text-gray-700">{users.length}</span>{' '}
          user{users.length === 1 ? '' : 's'}
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
              {filtered.length === 0 ? (
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
                filtered.map((u) => (
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
                      {formatDate(u.createdAt)}
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
      </div>
    </div>
  );
}