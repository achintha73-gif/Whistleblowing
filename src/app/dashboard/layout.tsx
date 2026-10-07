import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { DashboardShell } from '@/features/auth/components/DashboardShell';
import { getSidebarBadges } from '@/features/auth/services/sidebar.service';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) {
    redirect('/login');
  }

  const badges = await getSidebarBadges(user);

  return (
    <DashboardShell user={user} badges={badges}>
      {children}
    </DashboardShell>
  );
}