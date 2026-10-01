import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { SubmitComplaintForm } from '@/features/complaints/components/SubmitComplaintForm';

export const metadata = {
  title: 'Submit a complaint - Whistleblowing System',
};

export default async function NewComplaintPage() {
  const user = await getSession();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/dashboard/user"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          &larr; Back to dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Submit a Complaint
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Report a concern about unethical, illegal, or unsafe behavior. You can
          submit anonymously if you prefer.
        </p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
        <SubmitComplaintForm />
      </div>
    </div>
  );
}