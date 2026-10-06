'use client';

import Link from 'next/link';
import { Shield, Lock, FileText, Check } from 'lucide-react';

export function AnonymousLoginTab() {
  return (
    <div className="space-y-5">
      {/* Info banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
            <Shield className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-blue-900">
              Submit Anonymously
            </h2>
            <p className="mt-1 text-xs text-blue-800">
              Your identity will be completely hidden. No login required. You
              will receive a reference code to track your complaint.
            </p>
          </div>
        </div>
      </div>

      {/* Feature list */}
      <ul className="space-y-2 text-sm text-gray-700">
        <li className="flex items-start gap-2">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
          <span>No personal information required</span>
        </li>
        <li className="flex items-start gap-2">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
          <span>Receive a reference code to track status</span>
        </li>
        <li className="flex items-start gap-2">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
          <span>Add additional information and evidence later</span>
        </li>
        <li className="flex items-start gap-2">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
          <span>Your IP address is not stored</span>
        </li>
      </ul>

      {/* CTA button */}
      <Link
        href="/report"
        className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 transition"
      >
        <Lock className="h-4 w-4" />
        Continue Anonymously
        <span aria-hidden>→</span>
      </Link>

      {/* Track complaint link */}
      <div className="border-t border-gray-200 pt-4">
        <Link
          href="/track"
          className="flex w-full items-center justify-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
        >
          <FileText className="h-3.5 w-3.5" />
          Already submitted anonymously? Track your complaint
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}