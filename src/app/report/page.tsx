import Link from 'next/link';
import { Shield, ArrowRight } from 'lucide-react';
import { AnonymousComplaintForm } from '@/features/complaints/components/AnonymousComplaintForm';

export const metadata = {
  title: 'Report Anonymously - Whistleblowing System',
};

export default function ReportPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-blue-100 via-purple-100 to-gray-100">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed -top-40 -right-40 h-96 w-96 rounded-full bg-purple-300/30 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-300/30 blur-3xl" />

      {/* Header — glass */}
      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-md shadow-blue-500/30">
              <Shield className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-semibold text-gray-900">
              Whistleblowing System
            </span>
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
              <Shield className="h-6 w-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Submit a complaint anonymously
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Your identity will not be recorded. You will receive a reference
                code to track your complaint.
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/60 p-6 shadow-xl shadow-blue-900/5 backdrop-blur-xl sm:p-8">
            <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-blue-300/20 blur-3xl" />
            <div className="relative">
              <AnonymousComplaintForm />
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-600">
            Already submitted?{' '}
            <Link
              href="/track"
              className="inline-flex items-center gap-1 font-medium text-blue-600 transition hover:text-blue-700"
            >
              Track your complaint
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer — glass */}
      <footer className="relative z-10 border-t border-white/60 bg-white/40 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl px-6 py-3 text-xs text-gray-600">
          Whistleblowing Management System
        </div>
      </footer>
    </div>
  );
}