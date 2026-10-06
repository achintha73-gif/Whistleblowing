import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { ArrowLeft, FileText } from 'lucide-react';
import { SubmitComplaintForm } from '@/features/complaints/components/SubmitComplaintForm';

export const metadata = {
  title: 'Submit a complaint - Whistleblowing System',
};

export default async function NewComplaintPage() {
  const user = await getSession();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/user"
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 transition hover:text-blue-600"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" />
          Back to dashboard
        </Link>

        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Submit a Complaint
            </h1>
            <p className="mt-0.5 text-sm text-gray-600">
              Report a concern about unethical, illegal, or unsafe behavior.
            </p>
          </div>
        </div>
      </div>

      {/* Glass card form */}
      <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/60 p-6 shadow-xl shadow-blue-900/5 backdrop-blur-xl sm:p-8">
        {/* Decorative accent */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-blue-300/20 blur-3xl" />

        <div className="relative">
          <SubmitComplaintForm />
        </div>
      </div>
    </div>
  );
}