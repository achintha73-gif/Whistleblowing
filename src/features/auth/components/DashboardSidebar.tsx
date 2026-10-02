'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  PlusCircle,
  ListChecks,
  Bell,
  FolderOpen,
  FileText,
  Users,
  Settings,
} from 'lucide-react';
import type { RoleName, SafeUser } from '../types';

interface MenuItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

const MENU_BY_ROLE: Record<RoleName, MenuItem[]> = {
  USER: [
    { href: '/dashboard/user', label: 'Dashboard', icon: Home, exact: true },
    { href: '/dashboard/complaints/new', label: 'Submit Complaint', icon: PlusCircle },
    { href: '/dashboard/complaints', label: 'My Complaints', icon: ListChecks, exact: true },
    { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  ],
  MANAGER: [
    { href: '/dashboard/manager', label: 'Dashboard', icon: Home, exact: true },
    { href: '/dashboard/complaints', label: 'Complaints', icon: ListChecks },
    { href: '/dashboard/cases', label: 'Cases', icon: FolderOpen },
    { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  ],
  INVESTIGATOR: [
    { href: '/dashboard/investigator', label: 'Dashboard', icon: Home, exact: true },
    { href: '/dashboard/investigations', label: 'My Cases', icon: FolderOpen },
    { href: '/dashboard/evidence', label: 'Evidence', icon: FileText },
    { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  ],
  ADMIN: [
    { href: '/dashboard/admin', label: 'Dashboard', icon: Home, exact: true },
    { href: '/dashboard/users', label: 'Users', icon: Users },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    { href: '/dashboard/logs', label: 'Logs', icon: FileText },
  ],
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrator',
  MANAGER: 'Manager',
  INVESTIGATOR: 'Investigator',
  USER: 'Employee',
};

export function DashboardSidebar({
  roleName,
  user,
}: {
  roleName: RoleName;
  user: SafeUser;
}) {
  const pathname = usePathname();
  const items = MENU_BY_ROLE[roleName] ?? [];

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
      <nav className="flex-1 flex flex-col gap-1 p-3">
        {items.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + '/');

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon
                className={`h-5 w-5 shrink-0 ${
                  isActive ? 'text-blue-700' : 'text-gray-500'
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-3">
        <div className="rounded-lg bg-gray-50 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-gray-900">
                {user.name}
              </div>
              <div className="truncate text-xs text-gray-500">
                {ROLE_LABELS[user.roleName] ?? user.roleName}
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}