import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import {
  Paperclip,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Mail,
  Camera,
  ArrowRight,
} from 'lucide-react';
import { formatDateTime } from '@/lib/date-format';
import { getEvidenceOverviewForInvestigator } from '@/features/evidence/services/evidence.service';

export const metadata = {
  title: 'Evidence - Whistleblowing System',
};

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Document: FileText,
  Image: ImageIcon,
  Video: Video,
  Audio: Music,
  Email: Mail,
  Screenshot: Camera,
  Other: Paperclip,
};

export default async function EvidencePage() {
  const user = await getSession();
  if (!user) redirect('/login');

  if (user.roleName !== 'INVESTIGATOR') {
    redirect('/dashboard');
  }

  const groups = await getEvidenceOverviewForInvestigator(user);
  const totalEvidence = groups.reduce((sum, g) => sum + g.evidence.length, 0);
  const casesWithEvidence = groups.filter((g) => g.evidence.length > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
          <Paperclip className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Evidence
          </h1>
          <p className="mt-0.5 text-sm text-gray-600">
            All evidence you have collected, grouped by case.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-blue-200/60 bg-blue-50/60 p-4 shadow-sm backdrop-blur-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">
            Total Cases
          </div>
          <div className="mt-1 text-2xl font-bold text-gray-900">
            {groups.length}
          </div>
        </div>
        <div className="rounded-2xl border border-purple-200/60 bg-purple-50/60 p-4 shadow-sm backdrop-blur-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-purple-700">
            Cases with Evidence
          </div>
          <div className="mt-1 text-2xl font-bold text-gray-900">
            {casesWithEvidence}
          </div>
        </div>
        <div className="rounded-2xl border border-amber-200/60 bg-amber-50/60 p-4 shadow-sm backdrop-blur-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            Total Evidence Items
          </div>
          <div className="mt-1 text-2xl font-bold text-gray-900">
            {totalEvidence}
          </div>
        </div>
      </div>

      {/* Case groups */}
      {groups.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-gray-300 bg-white/60 p-12 text-center backdrop-blur-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Paperclip className="h-7 w-7" />
          </div>
          <p className="mt-3 text-sm font-semibold text-gray-900">
            No cases assigned to you yet
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Evidence you collect will appear here, grouped by case.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div
              key={group.caseId}
              className="rounded-2xl border border-white/60 bg-white/60 p-5 shadow-lg shadow-blue-900/5 backdrop-blur-xl"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    href={`/dashboard/cases/${group.caseId}`}
                    className="text-base font-semibold text-gray-900 transition hover:text-blue-700"
                  >
                    {group.complaintTitle}
                  </Link>
                  <div className="mt-0.5 text-xs text-gray-500">
                    Case #{group.caseId} · {group.evidence.length} evidence item
                    {group.evidence.length === 1 ? '' : 's'}
                  </div>
                </div>
                <Link
                  href={`/dashboard/cases/${group.caseId}`}
                  className="group inline-flex items-center gap-1 text-xs font-medium text-blue-600 transition hover:text-blue-700"
                >
                  View case
                  <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                </Link>
              </div>

              {group.evidence.length === 0 ? (
                <p className="text-xs italic text-gray-500">
                  No evidence collected for this case yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {group.evidence.map((e) => {
                    const Icon = ICONS[e.fileType] ?? Paperclip;
                    return (
                      <li
                        key={e.evidenceId}
                        className="flex items-start gap-3 rounded-xl border border-white/60 bg-white/50 p-3 backdrop-blur-sm"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="break-all text-sm font-medium text-gray-900">
                              {e.fileName}
                            </span>
                            <span className="rounded-md bg-white/70 px-1.5 py-0.5 text-xs text-gray-600">
                              {e.fileType}
                            </span>
                          </div>
                          {e.description && (
                            <p className="mt-0.5 text-xs text-gray-600">
                              {e.description}
                            </p>
                          )}
                          <p className="mt-0.5 text-xs text-gray-400">
                            {formatDateTime(e.uploadedAt)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}