'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Building2,
  PlusCircle,
  ListChecks,
  Bell,
  FolderOpen,
  FileText,
  Users,
  Settings,
  HelpCircle,
  X,
  Shield,
} from 'lucide-react';
import type { RoleName, SafeUser } from '../types';
import type { SidebarBadges } from '../services/sidebar.service';
import { SidebarLogoutButton } from './SidebarLogoutButton';

interface MenuItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: 'notifications' | 'complaints' | 'cases';
  exact?: boolean;
}

interface MenuSection {
  title?: string;
  items: MenuItem[];
}

const MENU_BY_ROLE: Record<RoleName, MenuSection[]> = {
  USER: [
    {
      items: [
        { href: '/dashboard/user', label: 'Dashboard', icon: Home, exact: true },
        { href: '/dashboard/complaints/new', label: 'Submit Complaint', icon: PlusCircle },
        { href: '/dashboard/complaints', label: 'My Complaints', icon: ListChecks, exact: true, badge: 'complaints' },
        { href: '/dashboard/notifications', label: 'Notifications', icon: Bell, badge: 'notifications' },
      ],
    },
  ],
  MANAGER: [
    {
      title: 'Main',
      items: [
        { href: '/dashboard/manager', label: 'Dashboard', icon: Home, exact: true },
        { href: '/dashboard/complaints', label: 'Complaints', icon: ListChecks, badge: 'complaints' },
        { href: '/dashboard/cases', label: 'Cases', icon: FolderOpen, badge: 'cases' },
        { href: '/dashboard/notifications', label: 'Notifications', icon: Bell, badge: 'notifications' },
      ],
    },
  ],
  INVESTIGATOR: [
    {
      title: 'Main',
      items: [
        { href: '/dashboard/investigator', label: 'Dashboard', icon: Home, exact: true },
        { href: '/dashboard/cases', label: 'My Cases', icon: FolderOpen, badge: 'cases' },
        { href: '/dashboard/evidence', label: 'Evidence', icon: FileText },
        { href: '/dashboard/notifications', label: 'Notifications', icon: Bell, badge: 'notifications' },
      ],
    },
  ],
  ADMIN: [
    {
      title: 'Administration',
      items: [
        { href: '/dashboard/admin', label: 'Dashboard', icon: Home, exact: true },
        { href: '/dashboard/users', label: 'Users', icon: Users },
        { href: '/dashboard/departments', label: 'Departments', icon: Building2 },
        { href: '/dashboard/notifications', label: 'Notifications', icon: Bell, badge: 'notifications' },
      ],
    },
    {
      title: 'System',
      items: [
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
        { href: '/dashboard/logs', label: 'Activity Logs', icon: FileText },
      ],
    },
  ],
};

export function DashboardSidebar({
  roleName,
  user,
  badges,
  isMobile = false,
  onClose,
}: {
  roleName: RoleName;
  user: SafeUser;
  badges: SidebarBadges;
  isMobile?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const sections = MENU_BY_ROLE[roleName] ?? [];
  const isSupportActive =
    pathname === '/dashboard/support' ||
    pathname.startsWith('/dashboard/support/');
  const isProfileActive =
    pathname === '/dashboard/profile' || pathname.startsWith('/dashboard/profile/');

  return (
    <aside
      className={`flex w-full flex-col bg-white/80 backdrop-blur-xl ${
        isMobile
          ? 'h-full shadow-2xl'
          : 'h-full w-64 shrink-0 border-r border-white/40'
      }`}
    >
      {isMobile && (
        <div className="flex shrink-0 items-center justify-between border-b border-white/40 px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-md shadow-blue-500/30">
              <Shield className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold text-gray-900">
              Whistleblowing
            </span>
          </Link>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/60 bg-white/60 text-gray-600 transition hover:bg-white hover:text-gray-900"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      <nav className={`flex-1 overflow-y-auto p-4 ${isMobile ? 'pt-4' : 'pt-6'}`}>
        {sections.map((section, sIdx) => (
          <div key={sIdx} className={sIdx > 0 ? 'mt-6' : ''}>
            {section.title && (
              <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                {section.title}
              </div>
            )}
            <div className="flex flex-col gap-1">
              {section.items.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href ||
                    pathname.startsWith(item.href + '/');
                const Icon = item.icon;
                const badgeValue = item.badge ? badges[item.badge] : 0;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                        : 'text-gray-700 hover:bg-white/60 hover:text-gray-900'
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-white/20'
                          : 'bg-white/50 group-hover:bg-white/80 group-hover:scale-105'
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 ${
                          isActive
                            ? 'text-white'
                            : 'text-gray-600 group-hover:text-gray-800'
                        }`}
                      />
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {badgeValue > 0 && (
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isActive
                            ? 'bg-white/25 text-white'
                            : 'bg-blue-500/15 text-blue-700'
                        }`}
                      >
                        {badgeValue > 99 ? '99+' : badgeValue}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/40 p-4 space-y-1">
        <Link
          href="/dashboard/profile"
          className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
            isProfileActive
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
              : 'text-gray-700 hover:bg-white/60 hover:text-gray-900'
          }`}
        >
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
              isProfileActive
                ? 'bg-white/20'
                : 'bg-white/50 group-hover:bg-white/80 group-hover:scale-105'
            }`}
          >
            <Users
              className={`h-4 w-4 ${
                isProfileActive
                  ? 'text-white'
                  : 'text-gray-600 group-hover:text-gray-800'
              }`}
            />
          </span>
          <span className="flex-1">My Profile</span>
        </Link>

        <Link
          href="/dashboard/support"
          className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
            isSupportActive
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
              : 'text-gray-700 hover:bg-white/60 hover:text-gray-900'
          }`}
        >
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
              isSupportActive
                ? 'bg-white/20'
                : 'bg-white/50 group-hover:bg-white/80 group-hover:scale-105'
            }`}
          >
            <HelpCircle
              className={`h-4 w-4 ${
                isSupportActive
                  ? 'text-white'
                  : 'text-gray-600 group-hover:text-gray-800'
              }`}
            />
          </span>
          <span className="flex-1">Support</span>
        </Link>

        <SidebarLogoutButton />
      </div>
    </aside>
  );
}