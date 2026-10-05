import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AnonymousComplaintForm } from '@/features/complaints/components/AnonymousComplaintForm';

export const metadata = {
  title: 'Submit Anonymously - Whistleblowing System',
};

export default function AnonymousPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/login"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Submit a Complaint Anonymously
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Your identity will not be recorded anywhere in the system.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <AnonymousComplaintForm />
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            Sign in as employee
          </Link>
        </p>
      </div>
    </div>
  );
}
