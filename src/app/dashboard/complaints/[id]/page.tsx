import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { ComplaintStatusBadge } from '@/features/complaints/components/ComplaintStatusBadge';
import {
  getComplaintForUser,
  canDeleteComplaint,
} from '@/features/complaints/services/complaint.service';
import { AdditionalInfoList } from '@/features/complaints/components/AdditionalInfoList';
import { AddAdditionalInfoForm } from '@/features/complaints/components/AddAdditionalInfoForm';
import { getAdditionalInfoForComplaint } from '@/features/complaints/services/additional-info.service';
import { EvidenceList } from '@/features/evidence/components/EvidenceList';
import { AddComplaintEvidenceForm } from '@/features/evidence/components/AddComplaintEvidenceForm';
import {
  getEvidenceForComplaint,
  canDeleteEvidence,
} from '@/features/evidence/services/evidence.service';
import { DeleteComplaintButton } from '@/features/complaints/components/DeleteComplaintButton';

export default async function ComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSession();
  if (!user) return null;

  const { id } = await params;
  const complaintId = Number(id);
  if (!Number.isInteger(complaintId) || complaintId <= 0) {
    notFound();
  }

  const complaint = await getComplaintForUser(user, complaintId);
  if (!complaint) {
    notFound();
  }

  const additionalInfo = await getAdditionalInfoForComplaint(
    user,
    complaintId
  );

  const evidence = await getEvidenceForComplaint(user, complaintId);

  // Compute which evidence can be deleted by this user
  const deletableIds: number[] = [];
  for (const ev of evidence) {
    const allowed = await canDeleteEvidence(user, ev.evidenceId);
    if (allowed) deletableIds.push(ev.evidenceId);
  }

  const canAddInfo =
    user.roleName === 'USER' &&
    !complaint.isAnonymous &&
    complaint.author?.userId === user.userId;

  const canAddEvidence = user.roleName === 'USER';

  const canDelete = await canDeleteComplaint(user, complaintId);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Link
          href="/dashboard/complaints"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          &larr; Back to complaints
        </Link>
        {canDelete && (
          <DeleteComplaintButton
            complaintId={complaint.complaintId}
            complaintTitle={complaint.title}
          />
        )}
      </div>

      {/* Complaint header + details */}
      <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">
              {complaint.title}
            </h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-gray-500 flex-wrap">
              {complaint.category && (
                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs">
                  {complaint.category}
                </span>
              )}
              {complaint.isAnonymous && (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                  Anonymous
                </span>
              )}
              <span>Complaint #{complaint.complaintId}</span>
            </div>
          </div>
          <div className="shrink-0">
            <ComplaintStatusBadge status={complaint.status} />
          </div>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            Description
          </h2>
          <p className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
            {complaint.description}
          </p>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Submitted by
            </div>
            <div className="mt-1 text-gray-900">
              {complaint.author ? (
                <>
                  <div className="font-medium">{complaint.author.name}</div>
                  <div className="text-gray-500">{complaint.author.email}</div>
                </>
              ) : (
                <span className="italic text-gray-500">Anonymous</span>
              )}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Submitted at
            </div>
            <div className="mt-1 text-gray-900">
              {new Date(complaint.createdAt).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Attached Evidence */}
      <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Attached Evidence ({evidence.length})
          </h2>
          {canAddEvidence && (
            <AddComplaintEvidenceForm complaintId={complaintId} />
          )}
        </div>
        {evidence.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center">
            <p className="text-sm text-gray-500">
              No evidence attached to this complaint.
            </p>
          </div>
        ) : (
          <EvidenceList evidence={evidence} deletableIds={deletableIds} />
        )}
      </div>

      {/* Additional Information */}
      <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Additional Information ({additionalInfo.length})
          </h2>
          {canAddInfo && <AddAdditionalInfoForm complaintId={complaintId} />}
        </div>
        <AdditionalInfoList items={additionalInfo} />
      </div>
    </div>
  );
}