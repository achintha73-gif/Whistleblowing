import Link from 'next/link';
import { CheckCircle2, Shield } from 'lucide-react';
import { ReferenceCodeDisplay } from '@/features/complaints/components/ReferenceCodeDisplay';

export const metadata = {
  title: 'Complaint Submitted - Whistleblowing System',
};

export default async function AnonymousSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  if (!code) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <h1 className="text-lg font-semibold text-red-900">
            Missing reference code
          </h1>
          <p className="mt-2 text-sm text-red-800">
            We could not find your reference code. If you just submitted a
            complaint, please try again.
          </p>
          <Link
            href="/report"
            className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Submit a complaint
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="text-lg font-semibold text-gray-900">
              Whistleblowing System
            </span>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-6 py-12">
          <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center mb-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700 mb-3">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              Complaint submitted successfully
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Thank you for your courage. Your complaint has been securely
              recorded.
            </p>
          </div>

          <ReferenceCodeDisplay code={code} />

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href={`/track/${encodeURIComponent(code)}`}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700"
            >
              View Complaint Status
            </Link>
            <Link
              href="/"
              className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}