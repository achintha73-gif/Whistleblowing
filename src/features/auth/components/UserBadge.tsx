import type { SafeUser } from '../types';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrator',
  MANAGER: 'Manager',
  INVESTIGATOR: 'Investigator',
  USER: 'Employee',
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-800',
  MANAGER: 'bg-blue-100 text-blue-800',
  INVESTIGATOR: 'bg-amber-100 text-amber-800',
  USER: 'bg-green-100 text-green-800',
};

export function UserBadge({ user }: { user: SafeUser }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-right hidden sm:block">
        <div className="text-sm font-medium text-gray-900">{user.name}</div>
        <div className="text-xs text-gray-500">{user.email}</div>
      </div>
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
          ROLE_COLORS[user.roleName] ?? 'bg-gray-100 text-gray-800'
        }`}
      >
        {ROLE_LABELS[user.roleName] ?? user.roleName}
      </span>
    </div>
  );
}