'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  X,
  Building2,
  Pencil,
  Trash2,
  Users,
  Loader2,
  AlertCircle,
  Check,
  UserCheck,
} from 'lucide-react';
import { formatDate } from '@/lib/date-format';
import type { DepartmentDTO } from '../types';

interface ManagerOption {
  userId: number;
  name: string;
  email: string;
}

export function DepartmentsClient({
  initialDepartments,
  managers,
}: {
  initialDepartments: DepartmentDTO[];
  managers: ManagerOption[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DepartmentDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DepartmentDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [managerId, setManagerId] = useState<string>('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const filtered = initialDepartments.filter((d) => {
    if (search) {
      const s = search.toLowerCase();
      if (
        !d.departmentName.toLowerCase().includes(s) &&
        !(d.managerName ?? '').toLowerCase().includes(s)
      ) {
        return false;
      }
    }
    if (statusFilter && d.status !== statusFilter) return false;
    return true;
  });

  function openCreate() {
    setEditing(null);
    setName('');
    setDescription('');
    setManagerId('');
    setStatus('active');
    setError(null);
    setModalOpen(true);
  }

  function openEdit(d: DepartmentDTO) {
    setEditing(d);
    setName(d.departmentName);
    setDescription(d.description ?? '');
    setManagerId(d.managerId ? String(d.managerId) : '');
    setStatus(d.status === 'inactive' ? 'inactive' : 'active');
    setError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      departmentName: name.trim(),
      description: description.trim() || null,
      managerId: managerId ? Number(managerId) : null,
      status,
    };

    try {
      const url = editing
        ? `/api/departments/${editing.departmentId}`
        : '/api/departments';
      const method = editing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to save');
        setLoading(false);
        return;
      }

      setSuccess(editing ? 'Department updated' : 'Department created');
      closeModal();
      router.refresh();
      setTimeout(() => setSuccess(null), 2500);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/departments/${deleteTarget.departmentId}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to delete');
        setLoading(false);
        return;
      }

      setSuccess('Department deleted');
      setDeleteTarget(null);
      router.refresh();
      setTimeout(() => setSuccess(null), 2500);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  const hasFilters = !!(search || statusFilter);

  return (
    <div className="space-y-5">
      {/* Filters + Create */}
      <div className="rounded-2xl border border-white/60 bg-white/60 p-3 shadow-lg shadow-blue-900/5 backdrop-blur-xl sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or manager..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white/70 py-2.5 pl-10 pr-3.5 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white/70 px-3.5 py-2.5 text-sm text-gray-900 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 lg:w-44"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatusFilter('');
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white/70 px-3.5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-white"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-700 hover:to-indigo-700"
          >
            <Plus className="h-4 w-4" />
            New Department
          </button>
        </div>
      </div>

      {/* Success message */}
      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          <Check className="h-4 w-4" />
          {success}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/60 shadow-lg shadow-blue-900/5 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-white/60 bg-white/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Department
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Manager
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Users
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Created
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
                        <Building2 className="h-7 w-7" />
                      </div>
                      <p className="mt-3 text-sm font-semibold text-gray-900">
                        No departments found
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Create the first one to get started.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.departmentId} className="transition hover:bg-white/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-semibold text-white">
                          {d.departmentName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-gray-900">
                            {d.departmentName}
                          </div>
                          {d.description && (
                            <div className="truncate text-xs text-gray-500">
                              {d.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {d.managerName ? (
                        <div>
                          <div className="font-medium">{d.managerName}</div>
                          <div className="text-xs text-gray-500">
                            {d.managerEmail}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs italic text-gray-400">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        <Users className="h-3 w-3" />
                        {d.userCount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                          d.status === 'active'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-gray-200 bg-gray-50 text-gray-600'
                        }`}
                      >
                        {d.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(d.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(d)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 transition hover:bg-blue-50 hover:text-blue-700"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteTarget(d);
                            setError(null);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/60 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <h2 className="text-base font-semibold text-gray-900">
                  {editing ? 'Edit Department' : 'New Department'}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Department Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={150}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-sm text-gray-900 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  placeholder="e.g., Finance, HR, IT"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-sm text-gray-900 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  placeholder="Optional description"
                />
              </div>

              <div>
                <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <UserCheck className="h-3.5 w-3.5 text-gray-400" />
                  Manager
                  <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-sm text-gray-900 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="">— No manager —</option>
                  {managers.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as 'active' | 'inactive')
                  }
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-sm text-gray-900 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : editing ? (
                    'Save Changes'
                  ) : (
                    'Create Department'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-white/60 bg-white p-5 shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-center text-base font-semibold text-gray-900">
              Delete Department?
            </h3>
            <p className="mt-1 text-center text-sm text-gray-600">
              Are you sure you want to delete{' '}
              <span className="font-medium">{deleteTarget.departmentName}</span>
              ?
              {deleteTarget.userCount > 0 && (
                <span className="mt-2 block rounded-lg bg-amber-50 px-2 py-1 text-xs text-amber-700">
                  ⚠️ {deleteTarget.userCount} user(s) are still assigned.
                  Reassign them first.
                </span>
              )}
            </p>

            {error && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={loading}
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={loading || deleteTarget.userCount > 0}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-red-500/30 transition hover:from-red-700 hover:to-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}