import Link from 'next/link';
import { Home, Search, Shield, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-100 via-purple-100 to-gray-100 px-4 py-10">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-purple-300/30 blur-3xl" />

      <div className="relative z-10 w-full max-w-lg">
        <div className="rounded-3xl border border-white/60 bg-white/60 p-8 text-center shadow-2xl shadow-blue-900/10 backdrop-blur-xl sm:p-12">
          {/* Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
            <Search className="h-10 w-10 text-white" strokeWidth={2.5} />
          </div>

          {/* 404 */}
          <div className="mt-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-7xl font-bold tracking-tight text-transparent sm:text-8xl">
              404
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-gray-900">
              Page not found
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Sorry, we couldn&apos;t find the page you&apos;re looking for. It
              might have been moved, deleted, or never existed.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/40"
            >
              <Home className="h-4 w-4" />
              Go to dashboard
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white/70 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>

          {/* Footer brand */}
          <div className="mt-8 flex items-center justify-center gap-2 border-t border-white/60 pt-6 text-xs text-gray-500">
            <Shield className="h-3.5 w-3.5 text-blue-600" />
            Whistleblowing Management System
          </div>
        </div>
      </div>
    </div>
  );
}