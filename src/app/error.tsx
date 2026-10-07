'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, Shield } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console (in production, send to error tracking service)
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-red-50 via-white to-orange-50 px-4 py-10">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-red-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-orange-200/30 blur-3xl" />

      <div className="relative z-10 w-full max-w-lg">
        <div className="rounded-3xl border border-white/60 bg-white/60 p-8 text-center shadow-2xl shadow-red-900/10 backdrop-blur-xl sm:p-12">
          {/* Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/30">
            <AlertTriangle className="h-10 w-10 text-white" strokeWidth={2.5} />
          </div>

          <div className="mt-6">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              An unexpected error occurred while rendering this page. Please try
              again or return to the dashboard.
            </p>

            {/* Error message (dev only) */}
            {process.env.NODE_ENV === 'development' && error.message && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-left">
                <p className="text-xs font-mono text-red-700 break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="mt-1 text-[10px] font-mono text-red-500">
                    Digest: {error.digest}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition hover:from-red-700 hover:to-rose-700 hover:shadow-red-500/40"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white/70 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-white"
            >
              <Home className="h-4 w-4" />
              Go to dashboard
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