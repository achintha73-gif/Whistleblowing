import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { trackComplaintByCode } from '@/features/complaints/services/anonymous.service';
import { TrackedComplaintView } from '@/features/complaints/components/TrackedComplaintView';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function TrackedComplaintPage({ params }: PageProps) {
  const { code } = await params;

  const complaint = await trackComplaintByCode(code);

  if (!complaint) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/anonymous/track"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Track another complaint
        </Link>

        <TrackedComplaintView complaint={complaint} />
      </div>
    </div>
  );
}
