import type { RoleName, UserStatus } from '@/features/auth/types';

export const ROLE_BADGE_STYLES: Record<RoleName, string> = {
  ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
  MANAGER: 'bg-blue-100 text-blue-800 border-blue-200',
  INVESTIGATOR: 'bg-amber-100 text-amber-800 border-amber-200',
  USER: 'bg-green-100 text-green-800 border-green-200',
};

export const STATUS_BADGE_STYLES: Record<UserStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-800 border-green-200',
  INACTIVE: 'bg-gray-100 text-gray-700 border-gray-200',
  SUSPENDED: 'bg-red-100 text-red-800 border-red-200',
};