import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { Briefcase, ArrowRight, AlertCircle } from 'lucide-react';
import { CasesListClient } from '@/features/cases/components/CasesListClient';
import { listCasesForUser } from '@/features/cases/services/case.service';

export const metadata = {
  title: 'Cases - Whistleblowing System',
};

export default async function CasesListPage() {
  const user = await getSession();
  if (!user) redirect('/login');

  // USER role cannot access cases
  if (user.roleName === 'USER') {
    redirect('/dashboard/user');
  }

  const cases = await listCasesForUser(user);

  const pageTitle =
    user.roleName === 'INVESTIGATOR' ? 'My Cases' : 'All Cases';
  const pageDescription =
    user.roleName === 'INVESTIGATOR'
      ? 'Cases assigned to you for investigation.'
      : 'All cases created from complaints.';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {pageTitle}
            </h1>
            <p className="mt-0.5 text-sm text-gray-600">{pageDescription}</p>
          </div>
        </div>

        {user.roleName === 'MANAGER' && (
          <Link
            href="/dashboard/complaints"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/40 shrink-0"
          >
            Review Complaints
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {cases.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-gray-300 bg-white/60 p-12 text-center backdrop-blur-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <AlertCircle className="h-7 w-7" />
          </div>
          <p className="mt-3 text-sm font-semibold text-gray-900">
            {user.roleName === 'INVESTIGATOR'
              ? 'No cases assigned yet'
              : 'No cases have been created yet'}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {user.roleName === 'INVESTIGATOR'
              ? 'Your manager will assign cases to you.'
              : 'Create a case from an approved complaint.'}
          </p>
          {user.roleName === 'MANAGER' && (
            <Link
              href="/dashboard/complaints"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-700 hover:to-indigo-700"
            >
              Review complaints
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      ) : (
        <CasesListClient
          cases={cases}
          isManager={user.roleName === 'MANAGER'}
        />
      )}
    </div>
  );
}