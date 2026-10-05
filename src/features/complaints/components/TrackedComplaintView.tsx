'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MessageSquarePlus,
  AlertTriangle,
} from 'lucide-react';

interface AdditionalInfo {
  infoId: number;
  title: string;
  description: string;
  informationType: string;
  submittedAt: Date;
}

interface Complaint {
  complaintId: number;
  referenceCode: string;
  title: string;
  description: string;
  category: string | null;
  status: string;
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
  additionalInfo: AdditionalInfo[];
}

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: typeof Clock; classes: string }
> = {
  PENDING: {
    label: 'Pending Review',
    icon: Clock,
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    icon: AlertCircle,
    classes: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  APPROVED: {
    label: 'Approved',
    icon: CheckCircle2,
    classes: 'bg-green-50 text-green-700 border-green-200',
  },
  REJECTED: {
    label: 'Rejected',
    icon: XCircle,
    classes: 'bg-red-50 text-red-700 border-red-200',
  },
  CONVERTED_TO_CASE: {
    label: 'Converted to Case',
    icon: FileText,
    classes: 'bg-purple-50 text-purple-700 border-purple-200',
  },
};

const INFO_TYPE_LABELS: Record<string, string> = {
  ADDITIONAL_DETAILS: 'Additional Details',
  CLARIFICATION: 'Clarification',
  SUPPORTING_INFO: 'Supporting Information',
  CORRECTION: 'Correction',
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function TrackedComplaintView({ complaint }: { complaint: Complaint }) {
  const router = useRouter();
  const statusConfig =
    STATUS_CONFIG[complaint.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = statusConfig.icon;

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [infoType, setInfoType] = useState('ADDITIONAL_DETAILS');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleAddInfo(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (title.trim().length < 3) {
      setError('Title must be at least 3 characters');
      return;
    }
    if (description.trim().length < 10) {
      setError('Description must be at least 10 characters');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/anonymous/additional-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceCode: complaint.referenceCode,
          title: title.trim(),
          description: description.trim(),
          informationType: infoType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to add information');
        setSubmitting(false);
        return;
      }

      setTitle('');
      setDescription('');
      setInfoType('ADDITIONAL_DETAILS');
      setShowForm(false);
      setSubmitting(false);
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Reference Code
            </p>
            <p className="mt-1 font-mono text-lg font-bold text-gray-900">
              {complaint.referenceCode}
            </p>
            <h1 className="mt-4 text-xl font-bold text-gray-900">
              {complaint.title}
            </h1>
            <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
              {complaint.category && (
                <>
                  <span>{complaint.category}</span>
                  <span>|</span>
                </>
              )}
              <span>Submitted {formatDate(complaint.createdAt)}</span>
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${statusConfig.classes}`}
          >
            <StatusIcon className="h-4 w-4" />
            {statusConfig.label}
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Description
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">
            {complaint.description}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Additional Information
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              {complaint.additionalInfo.length}{' '}
              {complaint.additionalInfo.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
            {showForm ? 'Cancel' : 'Add Info'}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleAddInfo}
            className="space-y-4 border-b border-gray-100 bg-gray-50 p-5"
          >
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Information Type
              </label>
              <select
                value={infoType}
                onChange={(e) => setInfoType(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ADDITIONAL_DETAILS">Additional Details</option>
                <option value="CLARIFICATION">Clarification</option>
                <option value="SUPPORTING_INFO">Supporting Information</option>
                <option value="CORRECTION">Correction</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                required
                maxLength={200}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief title for your information"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide your additional information here..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition"
            >
              {submitting ? 'Submitting...' : 'Add Information'}
            </button>
          </form>
        )}

        {complaint.additionalInfo.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <FileText className="h-6 w-6 text-gray-400" />
            </div>
            <p className="mt-3 text-sm font-medium text-gray-900">
              No additional information yet
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Click Add Info above to submit more details about your complaint.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {complaint.additionalInfo.map((info) => (
              <li key={info.infoId} className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-gray-900">
                        {info.title}
                      </p>
                      <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-blue-700">
                        {INFO_TYPE_LABELS[info.informationType] ||
                          info.informationType}
                      </span>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">
                      {info.description}
                    </p>
                    <p className="mt-2 text-xs text-gray-400">
                      {formatDate(info.submittedAt)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}