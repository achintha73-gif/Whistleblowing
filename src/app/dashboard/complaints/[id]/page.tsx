import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { ComplaintStatusBadge } from '@/features/complaints/components/ComplaintStatusBadge';
import { getComplaintForUser } from '@/features/complaints/services/complaint.service';
import { AdditionalInfoList } from '@/features/complaints/components/AdditionalInfoList';
import { AddAdditionalInfoForm } from '@/features/complaints/components/AddAdditionalInfoForm';
import {
  getAdditionalInfoForComplaint,
} from '@/features/complaints/services/additional-info.service';

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

  // Only the complaint owner (non-anonymous) can add more info
  const canAddInfo =
    user.roleName === 'USER' &&
    !complaint.isAnonymous &&
    complaint.author?.userId === user.userId;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/dashboard/complaints"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          &larr; Back to complaints
        </Link>
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