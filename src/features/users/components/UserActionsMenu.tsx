'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, UserCheck, UserX, Shield } from 'lucide-react';
import type { UserListItem } from '../types';

const ROLES: { id: number; label: string }[] = [
  { id: 1, label: 'Administrator' },
  { id: 2, label: 'Manager' },
  { id: 3, label: 'Investigator' },
  { id: 4, label: 'Employee' },
];

export function UserActionsMenu({ user }: { user: UserListItem }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
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

  async function patchUser(body: { status?: string; roleId?: number }) {
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
        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white p-1.5 text-gray-600 hover:bg-gray-50"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 w-56 origin-top-right rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="p-2">
            {saved && (
              <div className="mb-2 rounded-md bg-green-50 p-2 text-xs text-green-700">
                Saved!
              </div>
            )}
            {error && (
              <div className="mb-2 rounded-md bg-red-50 p-2 text-xs text-red-700">
                {error}
              </div>
            )}

            {/* Status: Activate */}
            {user.status !== 'ACTIVE' && (
              <button
                type="button"
                onClick={() => patchUser({ status: 'ACTIVE' })}
                disabled={loading}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <UserCheck className="h-4 w-4 text-green-600" />
                Activate account
              </button>
            )}

            {/* Status: Suspend */}
            {user.status !== 'SUSPENDED' && (
              <button
                type="button"
                onClick={() => patchUser({ status: 'SUSPENDED' })}
                disabled={loading}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <UserX className="h-4 w-4 text-red-600" />
                Suspend account
              </button>
            )}

            {/* Status: Deactivate */}
            {user.status !== 'INACTIVE' && (
              <button
                type="button"
                onClick={() => patchUser({ status: 'INACTIVE' })}
                disabled={loading}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <UserX className="h-4 w-4 text-gray-500" />
                Deactivate account
              </button>
            )}

            <div className="my-1 border-t border-gray-200" />

            {/* Role change */}
            <div className="px-2 py-1">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
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
                    className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-gray-50 disabled:opacity-50 ${
                      user.roleId === r.id
                        ? 'font-medium text-blue-700'
                        : 'text-gray-700'
                    }`}
                  >
                    <span>{r.label}</span>
                    {user.roleId === r.id && (
                      <span className="text-xs text-blue-600">current</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}