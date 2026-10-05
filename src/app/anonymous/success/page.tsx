'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import {
  CheckCircle2,
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const referenceCode = searchParams.get('code') || '';
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(referenceCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = referenceCode;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="w-full max-w-lg">
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>

          <h1 className="mt-5 text-xl font-bold text-gray-900">
            Complaint Submitted Successfully
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Your anonymous complaint has been received. Save your reference
            code below to track it later.
          </p>
        </div>

        {referenceCode && (
          <div className="mt-6 rounded-lg border-2 border-blue-300 bg-blue-50 p-4">
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-blue-700">
                Your Reference Code
              </p>
              <p className="mt-2 font-mono text-2xl font-bold tracking-wider text-blue-900">
                {referenceCode}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={copyCode}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-blue-300 bg-white px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100 transition"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy Code
                  </>
                )}
              </button>
              <Link
                href={`/anonymous/track?code=${encodeURIComponent(referenceCode)}`}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 transition"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Track Complaint
              </Link>
            </div>
          </div>
        )}

        <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs text-amber-800">
            <strong>Important:</strong> Save this code! It&apos;s your only
            way to check your complaint status or add additional information
            later. We cannot recover it if you lose it.
          </p>
        </div>

        <Link
          href="/login"
          className="mt-6 flex items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default function AnonymousSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <Suspense fallback={<div className="text-sm text-gray-500">Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
