import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function DashboardRootPage() {
  const user = await getSession();
  if (!user) {
    redirect('/login');
  }

  // Send each role to its own dashboard
  switch (user.roleName) {
    case 'ADMIN':
      redirect('/dashboard/admin');
    case 'MANAGER':
      redirect('/dashboard/manager');
    case 'INVESTIGATOR':
      redirect('/dashboard/investigator');
    case 'USER':
    default:
      redirect('/dashboard/user');
  }
}