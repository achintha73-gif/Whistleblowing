import Link from 'next/link';
import { Shield } from 'lucide-react';
import { TrackCodeForm } from '@/features/complaints/components/TrackCodeForm';

export const metadata = {
  title: 'Track Complaint - Whistleblowing System',
};

export default function TrackPage() {
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
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-lg px-6 py-12">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Track your complaint
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Enter the reference code you received when you submitted your
              complaint.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <TrackCodeForm />
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            Don&apos;t have a code?{' '}
            <Link
              href="/report"
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Submit a new complaint
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-3 text-xs text-gray-500">
          Whistleblowing Management System - University Project
        </div>
      </footer>
    </div>
  );
}