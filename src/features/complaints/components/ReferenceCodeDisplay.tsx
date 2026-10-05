'use client';

import { useState } from 'react';
import { Copy, Check, AlertTriangle, Shield } from 'lucide-react';

export function ReferenceCodeDisplay({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard might be blocked — no big deal
    }
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="h-4 w-4 text-blue-700" />
        <span className="text-xs font-semibold uppercase tracking-wide text-blue-900">
          Your Reference Code
        </span>
      </div>

      <div className="flex items-center gap-2">
        <code className="flex-1 select-all rounded-md bg-white border border-blue-300 px-4 py-3 text-center text-xl font-mono font-bold text-blue-900 tracking-widest">
          {code}
        </code>
        <button
          type="button"
          onClick={copyCode}
          className="shrink-0 rounded-md bg-blue-600 p-3 text-white hover:bg-blue-700 transition"
          title="Copy code"
        >
          {copied ? (
            <Check className="h-5 w-5" />
          ) : (
            <Copy className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3">
        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
        <div className="text-xs text-amber-900">
          <strong>Save this code now.</strong> We do not store your identity
          and cannot recover the code if you lose it. You will need it to:
          <ul className="mt-1 ml-4 list-disc space-y-0.5">
            <li>Check your complaint status</li>
            <li>Add more information</li>
            <li>Attach additional evidence</li>
          </ul>
        </div>
      </div>
    </div>
  );
}