'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FolderOpen,
  Loader2,
  X,
  AlertCircle,
  ArrowRight,
  Check,
  Sparkles,
} from 'lucide-react';
import { CASE_PRIORITY, CASE_PRIORITY_LABELS } from '../types';
import type { CasePriority } from '../types';

const PRIORITY_STYLES: Record<CasePriority, string> = {
  LOW: 'border-slate-300 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 shadow-sm shadow-slate-300/50',
  MEDIUM: 'border-blue-300 bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 shadow-sm shadow-blue-300/50',
  HIGH: 'border-amber-300 bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700 shadow-sm shadow-amber-300/50',
  CRITICAL: 'border-red-300 bg-gradient-to-br from-red-100 to-red-200 text-red-700 shadow-sm shadow-red-300/50',
};

export function CreateCaseButton({ complaintId }: { complaintId: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [priority, setPriority] = useState<CasePriority>('MEDIUM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaintId, priority }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create case');
        setLoading(false);
        return;
      }

      router.push(`/dashboard/cases/${data.caseDetail.caseId}`);
      router.refresh();
    } catch {
      setError('Network error');
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/50 active:translate-y-0 active:shadow-md"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Shine effect */}
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

        {/* Top inner highlight */}
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

        {/* Bottom inner shadow */}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-black/20 to-transparent" />

        {/* Icon with 3D depth */}
        <span className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/20 shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
          <FolderOpen className="h-3 w-3 drop-shadow-sm" strokeWidth={2.5} />
        </span>

        <span className="relative drop-shadow-sm">Create Case</span>

        {/* Sparkle on hover */}
        <Sparkles className="relative h-3 w-3 opacity-0 transition-all duration-300 group-hover:rotate-12 group-hover:opacity-100 group-hover:text-yellow-200" />
      </button>
    );
  }

  return (
    <div className="flex min-w-[220px] flex-col items-end gap-2">
      {error && (
        <div className="flex items-start gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs text-red-700 shadow-sm">
          <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
          <span className="max-w-[220px] text-left">{error}</span>
        </div>
      )}

      <div className="relative w-full overflow-hidden rounded-2xl border border-white/60 bg-white/90 p-3 shadow-2xl shadow-blue-900/20 backdrop-blur-xl">
        {/* Decorative gradient blob */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-24 w-24 rounded-full bg-gradient-to-br from-blue-300/40 to-purple-300/40 blur-2xl" />

        <div className="relative">
          <div className="mb-3 flex items-center gap-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm">
              <FolderOpen className="h-3 w-3 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xs font-bold text-gray-900">
              Create New Case
            </span>
          </div>

          {/* Priority label */}
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            Priority
          </div>

          {/* Priority chips — 3D */}
          <div className="mb-3 grid grid-cols-2 gap-1.5">
            {(Object.keys(CASE_PRIORITY) as CasePriority[]).map((p) => {
              const isActive = priority === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  disabled={loading}
                  className={`group relative inline-flex items-center justify-center gap-1 overflow-hidden rounded-xl border px-2 py-1.5 text-[10px] font-bold transition-all duration-200 ${
                    isActive
                      ? `${PRIORITY_STYLES[p]} -translate-y-0.5 scale-105 ring-2 ring-blue-500/40`
                      : 'border-gray-200 bg-white text-gray-500 hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-md'
                  } disabled:opacity-50`}
                >
                  {isActive && (
                    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                  )}
                  {isActive && <Check className="relative h-2.5 w-2.5" />}
                  <span className="relative">{CASE_PRIORITY_LABELS[p]}</span>
                </button>
              );
            })}
          </div>

          {/* Actions — 3D */}
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={handleCreate}
              disabled={loading}
              className="group relative inline-flex flex-1 items-center justify-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 px-3 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-500/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/50 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {/* Shine */}
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              {/* Top highlight */}
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

              {loading ? (
                <>
                  <Loader2 className="relative h-3 w-3 animate-spin" />
                  <span className="relative">Creating...</span>
                </>
              ) : (
                <>
                  <span className="relative">Create &amp; Open</span>
                  <ArrowRight className="relative h-3 w-3 drop-shadow-sm transition-transform duration-300 group-hover:translate-x-0.5" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="group flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-50 hover:text-gray-700 hover:shadow-md active:translate-y-0 disabled:opacity-50"
              aria-label="Cancel"
            >
              <X className="h-3.5 w-3.5 transition-transform group-hover:rotate-90" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}