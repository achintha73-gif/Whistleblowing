import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { FileText, Plus } from 'lucide-react';
import { ComplaintsListClient } from '@/features/complaints/components/ComplaintsListClient';
import {
  getMyComplaints,
  getAllComplaintsForStaff,
} from '@/features/complaints/services/complaint.service';

export const metadata = {
  title: 'Complaints - Whistleblowing System',
};

export default async function ComplaintsListPage() {
  const user = await getSession();
  if (!user) return null;

  const isStaff =
    user.roleName === 'MANAGER' ||
    user.roleName === 'INVESTIGATOR' ||
    user.roleName === 'ADMIN';

  const complaints = isStaff
    ? await getAllComplaintsForStaff(user)
    : await getMyComplaints(user);

  const pageTitle = isStaff ? 'All Complaints' : 'My Complaints';
  const pageDescription = isStaff
    ? 'All complaints submitted in the system.'
    : 'Complaints you have submitted. Anonymous complaints are not shown here to protect your identity.';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {pageTitle}
            </h1>
            <p className="mt-0.5 text-sm text-gray-600">{pageDescription}</p>
          </div>
        </div>

        {user.roleName === 'USER' && (
          <Link
            href="/dashboard/complaints/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/40 shrink-0"
          >
            <Plus className="h-4 w-4" />
            New Complaint
          </Link>
        )}
      </div>

      {complaints.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-gray-300 bg-white/60 p-12 text-center backdrop-blur-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <FileText className="h-7 w-7" />
          </div>
          <p className="mt-3 text-sm font-semibold text-gray-900">
            {isStaff
              ? 'No complaints have been submitted yet'
              : 'You have not submitted any complaints yet'}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {isStaff
              ? 'Complaints will appear here once submitted by employees.'
              : 'Submit your first complaint to get started.'}
          </p>
          {user.roleName === 'USER' && (
            <Link
              href="/dashboard/complaints/new"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-700 hover:to-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Submit your complaint
            </Link>
          )}
        </div>
      ) : (
        <ComplaintsListClient
          complaints={complaints}
          showCreateCaseAction={user.roleName === 'MANAGER'}
        />
      )}
    </div>
  );
}