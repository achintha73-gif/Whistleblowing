import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { ArrowLeft } from 'lucide-react';
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
      {/* Back + Delete */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/dashboard/complaints"
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 transition hover:text-blue-600"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" />
          Back to complaints
        </Link>
        {canDelete && (
          <DeleteComplaintButton
            complaintId={complaint.complaintId}
            complaintTitle={complaint.title}
          />
        )}
      </div>

      {/* Complaint header — glass */}
      <div className="rounded-2xl border border-white/60 bg-white/60 p-6 shadow-lg shadow-blue-900/5 backdrop-blur-xl">
        {/* Title + badge — stack on mobile */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
              {complaint.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
              {complaint.category && (
                <span className="rounded-md bg-white/70 px-2 py-0.5 text-xs font-medium">
                  {complaint.category}
                </span>
              )}
              {complaint.isAnonymous && (
                <span className="inline-flex items-center rounded-full bg-white/70 px-2 py-0.5 text-xs font-medium text-gray-700">
                  Anonymous
                </span>
              )}
              <span className="text-xs text-gray-500">
                Complaint #{complaint.complaintId}
              </span>
            </div>
          </div>
          <div className="shrink-0">
            <ComplaintStatusBadge status={complaint.status} />
          </div>
        </div>

        <div className="mt-6 border-t border-white/60 pt-6">
          <h2 className="mb-2 text-sm font-semibold text-gray-700">
            Description
          </h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
            {complaint.description}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-white/60 pt-6 text-sm sm:grid-cols-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
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
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
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

      {/* Attached Evidence — glass */}
      <div className="rounded-2xl border border-white/60 bg-white/60 p-6 shadow-lg shadow-blue-900/5 backdrop-blur-xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Attached Evidence ({evidence.length})
          </h2>
          {canAddEvidence && (
            <AddComplaintEvidenceForm complaintId={complaintId} />
          )}
        </div>
        {evidence.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white/50 p-6 text-center">
            <p className="text-sm text-gray-500">
              No evidence attached to this complaint.
            </p>
          </div>
        ) : (
          <EvidenceList evidence={evidence} deletableIds={deletableIds} />
        )}
      </div>

      {/* Additional Information — glass */}
      <div className="rounded-2xl border border-white/60 bg-white/60 p-6 shadow-lg shadow-blue-900/5 backdrop-blur-xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
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