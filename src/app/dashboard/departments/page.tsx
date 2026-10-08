import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { Building2 } from 'lucide-react';
import { DepartmentsClient } from '@/features/users/components/DepartmentsClient';
import { listDepartments } from '@/features/users/services/department.service';
import { prisma } from '@/lib/db';

export const metadata = {
  title: 'Departments - Whistleblowing System',
};

export default async function DepartmentsPage() {
  const user = await getSession();
  if (!user) redirect('/login');
  if (user.roleName !== 'ADMIN') redirect('/dashboard');

  const departments = await listDepartments(user);

  // Get all users who can be managers (MANAGER or ADMIN role)
  const managerRows = await prisma.user.findMany({
    where: {
      status: 'ACTIVE',
      role: {
        role_name: { in: ['MANAGER', 'ADMIN'] },
      },
    },
    select: {
      user_id: true,
      name: true,
      email: true,
    },
    orderBy: { name: 'asc' },
  });

  const managers = managerRows.map((m) => ({
    userId: m.user_id,
    name: m.name,
    email: m.email,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Departments
            </h1>
            <p className="mt-0.5 text-sm text-gray-600">
              Manage departments and assign managers.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl border border-white/60 bg-white/60 px-3.5 py-2 shadow-lg shadow-blue-900/5 backdrop-blur-xl">
          <Building2 className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-semibold text-gray-900">
            {departments.length} department{departments.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Client */}
      <DepartmentsClient
        initialDepartments={departments}
        managers={managers}
      />
    </div>
  );
}