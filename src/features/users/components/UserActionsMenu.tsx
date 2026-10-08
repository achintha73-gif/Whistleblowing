'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, UserCheck, UserX, Shield, Building2 } from 'lucide-react';
import type { UserListItem } from '../types';

const ROLES: { id: number; label: string }[] = [
  { id: 1, label: 'Administrator' },
  { id: 2, label: 'Manager' },
  { id: 3, label: 'Investigator' },
  { id: 4, label: 'Employee' },
];

interface Department {
  departmentId: number;
  departmentName: string;
}

export function UserActionsMenu({ user }: { user: UserListItem }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  // Fetch departments when menu opens (once)
  useEffect(() => {
    if (open && departments.length === 0) {
      setLoadingDepts(true);
      fetch('/api/departments')
        .then((res) => res.json())
        .then((data) => {
          if (data.departments) setDepartments(data.departments);
        })
        .catch(() => {
          /* silent */
        })
        .finally(() => setLoadingDepts(false));
    }
  }, [open, departments.length]);

  async function patchUser(body: {
    status?: string;
    roleId?: number;
    departmentId?: number | null;
  }) {
    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch(`/api/users/${user.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Update failed');
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
    <div ref={menuRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-lg border border-white/60 bg-white/60 p-1.5 text-gray-600 backdrop-blur-sm transition hover:bg-white"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 max-h-[80vh] w-64 origin-top-right overflow-y-auto rounded-2xl border border-white/60 bg-white/90 shadow-2xl backdrop-blur-xl">
          <div className="p-2">
            {saved && (
              <div className="mb-2 rounded-xl bg-green-50 p-2 text-xs font-medium text-green-700">
                ✓ Saved!
              </div>
            )}
            {error && (
              <div className="mb-2 rounded-xl bg-red-50 p-2 text-xs text-red-700">
                {error}
              </div>
            )}

            {/* Status actions */}
            {user.status !== 'ACTIVE' && (
              <button
                type="button"
                onClick={() => patchUser({ status: 'ACTIVE' })}
                disabled={loading}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                <UserCheck className="h-4 w-4 text-green-600" />
                Activate account
              </button>
            )}

            {user.status !== 'SUSPENDED' && (
              <button
                type="button"
                onClick={() => patchUser({ status: 'SUSPENDED' })}
                disabled={loading}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                <UserX className="h-4 w-4 text-red-600" />
                Suspend account
              </button>
            )}

            {user.status !== 'INACTIVE' && (
              <button
                type="button"
                onClick={() => patchUser({ status: 'INACTIVE' })}
                disabled={loading}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                <UserX className="h-4 w-4 text-gray-500" />
                Deactivate account
              </button>
            )}

            <div className="my-1 border-t border-gray-200" />

            {/* Role change */}
            <div className="px-2 py-1">
              <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                <Shield className="h-3 w-3" />
                Change Role
              </div>
              <div className="space-y-0.5">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => patchUser({ roleId: r.id })}
                    disabled={loading || user.roleId === r.id}
                    className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm transition hover:bg-gray-50 disabled:opacity-50 ${
                      user.roleId === r.id
                        ? 'font-medium text-blue-700'
                        : 'text-gray-700'
                    }`}
                  >
                    <span>{r.label}</span>
                    {user.roleId === r.id && (
                      <span className="text-[10px] text-blue-600">current</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="my-1 border-t border-gray-200" />

            {/* Department change */}
            <div className="px-2 py-1">
              <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                <Building2 className="h-3 w-3" />
                Change Department
              </div>

              {loadingDepts ? (
                <div className="px-2 py-2 text-xs text-gray-500">
                  Loading...
                </div>
              ) : (
                <div className="space-y-0.5">
                  {/* No department option */}
                  <button
                    type="button"
                    onClick={() => patchUser({ departmentId: null })}
                    disabled={loading || user.departmentId === null}
                    className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm italic transition hover:bg-gray-50 disabled:opacity-50 ${
                      user.departmentId === null
                        ? 'font-medium text-blue-700 not-italic'
                        : 'text-gray-500'
                    }`}
                  >
                    <span>No department</span>
                    {user.departmentId === null && (
                      <span className="text-[10px] text-blue-600 not-italic">
                        current
                      </span>
                    )}
                  </button>

                  {/* Each department */}
                  {departments.map((d) => (
                    <button
                      key={d.departmentId}
                      type="button"
                      onClick={() =>
                        patchUser({ departmentId: d.departmentId })
                      }
                      disabled={loading || user.departmentId === d.departmentId}
                      className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm transition hover:bg-gray-50 disabled:opacity-50 ${
                        user.departmentId === d.departmentId
                          ? 'font-medium text-blue-700'
                          : 'text-gray-700'
                      }`}
                    >
                      <span className="truncate">{d.departmentName}</span>
                      {user.departmentId === d.departmentId && (
                        <span className="shrink-0 text-[10px] text-blue-600">
                          current
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}