'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, User as UserIcon, Settings, ChevronDown } from 'lucide-react';
import type { SafeUser } from '../types';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrator',
  MANAGER: 'Manager',
  INVESTIGATOR: 'Investigator',
  USER: 'Employee',
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'from-purple-500 to-purple-700',
  MANAGER: 'from-blue-500 to-blue-700',
  INVESTIGATOR: 'from-amber-500 to-orange-600',
  USER: 'from-emerald-500 to-emerald-700',
};

export function UserMenu({ user }: { user: SafeUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open]);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      setLoading(false);
    }
  }

  const roleLabel = ROLE_LABELS[user.roleName] ?? user.roleName;
  const avatarGradient =
    ROLE_COLORS[user.roleName] ?? 'from-slate-500 to-slate-700';

  return (
    <div ref={menuRef} className="relative">
      {/* Avatar button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="group flex items-center gap-1.5 rounded-full p-0.5 hover:bg-gray-100 transition"
        aria-label="Account menu"
      >
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${avatarGradient} text-sm font-semibold text-white shadow-sm`}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right rounded-xl border border-gray-200 bg-white shadow-lg animate-in fade-in slide-in-from-top-1 duration-100">
          {/* User info header */}
          <div className="border-b border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarGradient} text-base font-semibold text-white`}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-gray-900">
                  {user.name}
                </div>
                <div className="truncate text-xs text-gray-500">
                  {user.email}
                </div>
              </div>
            </div>
            <div className="mt-3 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-700">
              {roleLabel}
            </div>
          </div>

          {/* Menu items */}
          <div className="p-1.5">
            <Link
              href="/dashboard/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <UserIcon className="h-4 w-4 text-gray-400" />
              Profile
            </Link>

            {user.roleName === 'ADMIN' && (
              <Link
                href="/dashboard/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Settings className="h-4 w-4 text-gray-400" />
                Settings
              </Link>
            )}
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 p-1.5">
            <button
              type="button"
              onClick={handleLogout}
              disabled={loading}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              {loading ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}