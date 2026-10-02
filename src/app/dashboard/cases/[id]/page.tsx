import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
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
      <div>
        <Link
          href="/dashboard/cases"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          &larr; Back to cases
        </Link>
      </div>

      {/* Header */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">
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

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-t border-gray-200 pt-4">
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
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
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
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
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
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
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
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

      {/* Complaint */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">
          Complaint Details
        </h2>
        <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500 mb-3">
          {caseDetail.complaintCategory && (
            <span className="rounded-md bg-gray-100 px-2 py-0.5">
              {caseDetail.complaintCategory}
            </span>
          )}
          {caseDetail.complaintIsAnonymous && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-700">
              Anonymous
            </span>
          )}
        </div>
        <p className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
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
        />
      )}

      {/* Evidence */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Evidence ({evidence.length})
          </h2>
          {canAdd && <AddEvidenceForm caseId={caseDetail.caseId} />}
        </div>
        <EvidenceList evidence={evidence} />
      </div>

      {/* Investigation Report */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <ReportPanel
          caseId={caseDetail.caseId}
          report={report}
          canEdit={canEditReport}
        />
      </div>

      {/* Timeline */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Status History
        </h2>
        <CaseStatusTimeline history={history} />
      </div>
    </div>
  );
}