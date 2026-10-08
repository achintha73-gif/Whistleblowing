import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { ArrowLeft } from 'lucide-react';
import { CaseStatusBadge } from '@/features/cases/components/CaseStatusBadge';
import { CasePriorityBadge } from '@/features/cases/components/CasePriorityBadge';
import { CaseStatusTimeline } from '@/features/cases/components/CaseStatusTimeline';
import { AssignInvestigatorDropdown } from '@/features/cases/components/AssignInvestigatorDropdown';
import { UpdateStatusPanel } from '@/features/cases/components/UpdateStatusPanel';
import {
  getCaseForUser,
  getCaseHistory,
} from '@/features/cases/services/case.service';
import { EvidenceList } from '@/features/evidence/components/EvidenceList';
import { AddEvidenceForm } from '@/features/evidence/components/AddEvidenceForm';
import {
  getEvidenceForCase,
  canAddEvidence,
} from '@/features/evidence/services/evidence.service';
import { ReportPanel } from '@/features/investigation/components/ReportPanel';
import {
  getReportForCase,
  canUpsertReport,
} from '@/features/investigation/services/report.service';

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSession();
  if (!user) redirect('/login');

  const { id } = await params;
  const caseId = Number(id);
  if (!Number.isInteger(caseId) || caseId <= 0) {
    notFound();
  }

  const caseDetail = await getCaseForUser(user, caseId);
  if (!caseDetail) {
    notFound();
  }

  const history = await getCaseHistory(caseId);
  const evidence = await getEvidenceForCase(user, caseId);
  const canAdd = await canAddEvidence(user, caseId);
  const report = await getReportForCase(user, caseId);
  const canEditReport = await canUpsertReport(user, caseId);

  const isManager = user.roleName === 'MANAGER';
  const isAssignedInvestigator =
    user.roleName === 'INVESTIGATOR' &&
    caseDetail.assignedInvestigator?.userId === user.userId;
  const canUpdateStatus = isManager || isAssignedInvestigator;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard/cases"
        className="group inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 transition hover:text-blue-600"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" />
        Back to cases
      </Link>

      {/* Header — glass */}
      <div className="rounded-2xl border border-white/60 bg-white/60 p-6 shadow-lg shadow-blue-900/5 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {caseDetail.complaintTitle}
            </h1>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <CaseStatusBadge status={caseDetail.status} />
              <CasePriorityBadge priority={caseDetail.priority} />
              <span className="text-xs text-gray-500">
                Case #{caseDetail.caseId} · Complaint #{caseDetail.complaintId}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-white/60 pt-4 text-sm sm:grid-cols-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Created
            </div>
            <div className="mt-1 text-gray-900">
              {new Date(caseDetail.createdAt).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Last Updated
            </div>
            <div className="mt-1 text-gray-900">
              {new Date(caseDetail.updatedAt).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Closed
            </div>
            <div className="mt-1 text-gray-900">
              {caseDetail.closedAt
                ? new Date(caseDetail.closedAt).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })
                : '—'}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Assigned Investigator
            </div>
            <div className="mt-1 text-gray-900">
              {caseDetail.assignedInvestigator ? (
                <>
                  <div className="font-medium">
                    {caseDetail.assignedInvestigator.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {caseDetail.assignedInvestigator.email}
                  </div>
                </>
              ) : (
                <span className="italic text-amber-600">Unassigned</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Complaint — glass */}
      <div className="rounded-2xl border border-white/60 bg-white/60 p-6 shadow-lg shadow-blue-900/5 backdrop-blur-xl">
        <h2 className="mb-2 text-sm font-semibold text-gray-700">
          Complaint Details
        </h2>
        <div className="mb-3 flex items-center gap-2 flex-wrap text-xs text-gray-500">
          {caseDetail.complaintCategory && (
            <span className="rounded-md bg-white/70 px-2 py-0.5">
              {caseDetail.complaintCategory}
            </span>
          )}
          {caseDetail.complaintIsAnonymous && (
            <span className="rounded-full bg-white/70 px-2 py-0.5 font-medium text-gray-700">
              Anonymous
            </span>
          )}
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
          {caseDetail.complaintDescription}
        </p>
      </div>

      {/* Assign investigator (manager only) */}
      {isManager && (
        <AssignInvestigatorDropdown
          caseId={caseDetail.caseId}
          currentInvestigatorId={
            caseDetail.assignedInvestigator?.userId ?? null
          }
        />
      )}

      {/* Update status */}
      {canUpdateStatus && (
        <UpdateStatusPanel
          caseId={caseDetail.caseId}
          currentStatus={caseDetail.status}
          viewerRole={user.roleName}
        />
      )}

      {/* Evidence — glass */}
      <div className="rounded-2xl border border-white/60 bg-white/60 p-6 shadow-lg shadow-blue-900/5 backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-sm font-semibold text-gray-700">
            Evidence ({evidence.length})
          </h2>
          {canAdd && <AddEvidenceForm caseId={caseDetail.caseId} />}
        </div>
        <EvidenceList evidence={evidence} />
      </div>

      {/* Investigation Report — glass */}
      <div className="rounded-2xl border border-white/60 bg-white/60 p-6 shadow-lg shadow-blue-900/5 backdrop-blur-xl">
        <ReportPanel
          caseId={caseDetail.caseId}
          report={report}
          canEdit={canEditReport}
        />
      </div>

      {/* Timeline — glass */}
      <div className="rounded-2xl border border-white/60 bg-white/60 p-6 shadow-lg shadow-blue-900/5 backdrop-blur-xl">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">
          Status History
        </h2>
        <CaseStatusTimeline history={history} />
      </div>
    </div>
  );
}