import Link from 'next/link';
import { Shield } from 'lucide-react';
import { AnonymousComplaintForm } from '@/features/complaints/components/AnonymousComplaintForm';

export const metadata = {
  title: 'Report Anonymously - Whistleblowing System',
};

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="text-lg font-semibold text-gray-900">
              Whistleblowing System
            </span>
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Submit a complaint anonymously
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Your identity will not be recorded. You will receive a reference
              code to track your complaint.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <AnonymousComplaintForm />
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            Already submitted?{' '}
            <Link
              href="/track"
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Track your complaint
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-3 text-xs text-gray-500">
          Whistleblowing Management System - University Project
        </div>
      </footer>
    </div>
  );
}