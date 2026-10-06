import Link from 'next/link';
import { Shield, AlertCircle, ArrowRight } from 'lucide-react';
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
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-blue-100 via-purple-100 to-gray-100">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed -top-40 -right-40 h-96 w-96 rounded-full bg-purple-300/30 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-300/30 blur-3xl" />

      {/* Header — glass */}
      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-md shadow-blue-500/30">
              <Shield className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-semibold text-gray-900">
              Whistleblowing System
            </span>
          </Link>
          <Link
            href="/track"
            className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
          >
            Track another
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1">
        <div className="mx-auto max-w-4xl px-6 py-8">
          {!complaint ? (
            <div className="mx-auto max-w-md">
              <div className="relative overflow-hidden rounded-3xl border border-red-200/60 bg-white/60 p-8 text-center shadow-xl shadow-red-900/5 backdrop-blur-xl">
                <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-red-300/20 blur-3xl" />
                <div className="relative">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
                    <AlertCircle className="h-7 w-7" />
                  </div>
                  <h1 className="mt-4 text-lg font-semibold text-gray-900">
                    Complaint not found
                  </h1>
                  <p className="mt-2 text-sm text-gray-600">
                    We could not find a complaint with that reference code.
                    Please double-check the code and try again.
                  </p>
                  <Link
                    href="/track"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-700 hover:to-indigo-700"
                  >
                    Try another code
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <TrackedComplaintView complaint={complaint} />
          )}
        </div>
      </main>

      {/* Footer — glass */}
      <footer className="relative z-10 border-t border-white/60 bg-white/40 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-6 py-3 text-xs text-gray-600">
          Whistleblowing Management System
        </div>
      </footer>
    </div>
  );
}