import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { ComplaintCard } from '@/features/complaints/components/ComplaintCard';
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
          <p className="mt-1 text-sm text-gray-600">{pageDescription}</p>
        </div>

        {user.roleName === 'USER' && (
          <Link
            href="/dashboard/complaints/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shrink-0"
          >
            + New Complaint
          </Link>
        )}
      </div>

      {complaints.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="text-sm text-gray-500">
            {isStaff
              ? 'No complaints have been submitted yet.'
              : 'You have not submitted any complaints yet.'}
          </p>
          {user.roleName === 'USER' && (
            <Link
              href="/dashboard/complaints/new"
              className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Submit your first complaint
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((complaint) => (
            <ComplaintCard key={complaint.complaintId} complaint={complaint} />
          ))}
        </div>
      )}
    </div>
  );
}