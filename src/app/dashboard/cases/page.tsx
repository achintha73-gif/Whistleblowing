import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { CaseCard } from '@/features/cases/components/CaseCard';
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
        <p className="mt-1 text-sm text-gray-600">{pageDescription}</p>
      </div>

      {cases.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="text-sm text-gray-500">
            {user.roleName === 'INVESTIGATOR'
              ? 'You have no cases assigned yet.'
              : 'No cases have been created yet.'}
          </p>
          {user.roleName === 'MANAGER' && (
            <Link
              href="/dashboard/complaints"
              className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Review complaints to create a case
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map((caseItem) => (
            <CaseCard key={caseItem.caseId} caseItem={caseItem} />
          ))}
        </div>
      )}
    </div>
  );
}