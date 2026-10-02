import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { Paperclip, FileText, Image, Video, Music, Mail, Camera } from 'lucide-react';
import { getEvidenceOverviewForInvestigator } from '@/features/evidence/services/evidence.service';

export const metadata = {
  title: 'Evidence - Whistleblowing System',
};

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Document: FileText,
  Image: Image,
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Evidence</h1>
        <p className="mt-1 text-sm text-gray-600">
          All evidence you have collected, grouped by case.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-blue-700">
            Total Cases
          </div>
          <div className="mt-1 text-2xl font-bold text-gray-900">
            {groups.length}
          </div>
        </div>
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-purple-700">
            Cases with Evidence
          </div>
          <div className="mt-1 text-2xl font-bold text-gray-900">
            {casesWithEvidence}
          </div>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-amber-700">
            Total Evidence Items
          </div>
          <div className="mt-1 text-2xl font-bold text-gray-900">
            {totalEvidence}
          </div>
        </div>
      </div>

      {/* Case groups */}
      {groups.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
          <Paperclip className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-600">
            No cases assigned to you yet.
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
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="min-w-0">
                  <Link
                    href={`/dashboard/cases/${group.caseId}`}
                    className="text-base font-semibold text-gray-900 hover:text-blue-700"
                  >
                    {group.complaintTitle}
                  </Link>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Case #{group.caseId} · {group.evidence.length} evidence item
                    {group.evidence.length === 1 ? '' : 's'}
                  </div>
                </div>
                <Link
                  href={`/dashboard/cases/${group.caseId}`}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  View case &rarr;
                </Link>
              </div>

              {group.evidence.length === 0 ? (
                <p className="text-xs text-gray-500 italic">
                  No evidence collected for this case yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {group.evidence.map((e) => {
                    const Icon = ICONS[e.fileType] ?? Paperclip;
                    return (
                      <li
                        key={e.evidenceId}
                        className="flex items-start gap-3 rounded-md bg-gray-50 p-3"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-700">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-gray-900 break-all">
                              {e.fileName}
                            </span>
                            <span className="rounded-md bg-white px-1.5 py-0.5 text-xs text-gray-600">
                              {e.fileType}
                            </span>
                          </div>
                          {e.description && (
                            <p className="mt-0.5 text-xs text-gray-600">
                              {e.description}
                            </p>
                          )}
                          <p className="mt-0.5 text-xs text-gray-400">
                            {new Date(e.uploadedAt).toLocaleString('en-US', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
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