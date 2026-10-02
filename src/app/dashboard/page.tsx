import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import type { RoleName } from '@/features/auth/types';

const ROLE_DASHBOARDS: Record<RoleName, string> = {
  ADMIN: '/dashboard/admin',
  MANAGER: '/dashboard/manager',
  INVESTIGATOR: '/dashboard/investigator',
  USER: '/dashboard/user',
};

export default async function DashboardRootPage() {
  const user = await getSession();
  if (!user) {
    redirect('/login');
  }

  const target = ROLE_DASHBOARDS[user.roleName] ?? '/dashboard/user';
  redirect(target);
}