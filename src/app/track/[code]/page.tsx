import Link from 'next/link';
import { Shield } from 'lucide-react';
import { TrackedComplaintView } from '@/features/complaints/components/TrackedComplaintView';
import { prisma } from '@/lib/db';
import {
  normalizeReferenceCode,
  isValidReferenceCode,
} from '@/lib/reference-code';

async function getComplaintByCode(rawCode: string) {
  const code = normalizeReferenceCode(decodeURIComponent(rawCode));
  if (!isValidReferenceCode(code)) return null;

  const complaint = await prisma.complaint.findUnique({
    where: { reference_code: code },
    include: {
      additionalInfo: {
        orderBy: { submitted_at: 'desc' },
        select: {
          info_id: true,
          title: true,
          description: true,
          informationType: true,
          submitted_at: true,
        },
      },
    },
  });

  if (!complaint) return null;
  if (!complaint.isAnonymous || complaint.user_id !== null) return null;

  return {
    complaintId: complaint.complaint_id,
    referenceCode: complaint.reference_code ?? code,
    title: complaint.title,
    description: complaint.description,
    category: complaint.category,
    status: complaint.status,
    isAnonymous: complaint.isAnonymous,
    createdAt: complaint.created_at,
    updatedAt: complaint.updated_at,
    additionalInfo: complaint.additionalInfo.map((a) => ({
      infoId: a.info_id,
      title: a.title,
      description: a.description,
      informationType: a.informationType,
      submittedAt: a.submitted_at,
    })),
  };
}

export default async function TrackedComplaintPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const complaint = await getComplaintByCode(code);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="text-lg font-semibold text-gray-900">
              Whistleblowing System
            </span>
          </Link>
          <Link
            href="/track"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Track another
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-6 py-8">
          {!complaint ? (
            <div className="mx-auto max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
              <h1 className="text-lg font-semibold text-red-900">
                Complaint not found
              </h1>
              <p className="mt-2 text-sm text-red-800">
                We could not find a complaint with that reference code. Please
                double-check the code and try again.
              </p>
              <Link
                href="/track"
                className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Try another code
              </Link>
            </div>
          ) : (
            <TrackedComplaintView complaint={complaint} />
          )}
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-3 text-xs text-gray-500">
          Whistleblowing Management System - University Project
        </div>
      </footer>
    </div>
  );
}