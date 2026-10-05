import type { EvidenceDTO } from '../types';
import { DeleteEvidenceButton } from './DeleteEvidenceButton';
import {
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Mail,
  Camera,
  Paperclip,
  Download,
  Eye,
} from 'lucide-react';

const FILE_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Document: FileText,
  Image: ImageIcon,
  Video: Video,
  Audio: Music,
  Email: Mail,
  Screenshot: Camera,
  Other: Paperclip,
};

export function EvidenceList({
  evidence,
  deletableIds = [],
}: {
  evidence: EvidenceDTO[];
  /** IDs of evidence items the current user can delete */
  deletableIds?: number[];
}) {
  if (evidence.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <Paperclip className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">No evidence collected yet.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {evidence.map((item) => {
        const Icon = FILE_TYPE_ICONS[item.fileType] ?? Paperclip;
        const canDelete = deletableIds.includes(item.evidenceId);

        return (
          <li
            key={item.evidenceId}
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-semibold text-gray-900 break-all">
                    {item.fileName}
                  </h4>
                  <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {item.fileType}
                  </span>
                  {item.hasFile && (
                    <span className="rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      File attached
                    </span>
                  )}
                  {item.source === 'complaint' && (
                    <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      From complaint
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">
                    {item.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  Added{' '}
                  {new Date(item.uploadedAt).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                  {item.uploadedBy && ` · by ${item.uploadedBy.name}`}
                </p>

                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  {item.hasFile && (
                    <>
                      <a
                        href={`/api/evidence/${item.evidenceId}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Eye className="h-3 w-3" />
                        Preview
                      </a>
                      <a
                        href={`/api/evidence/${item.evidenceId}/download`}
                        download={item.fileName}
                        className="inline-flex items-center gap-1 rounded-md border border-blue-300 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </a>
                    </>
                  )}
                  {canDelete && (
                    <DeleteEvidenceButton
                      evidenceId={item.evidenceId}
                      fileName={item.fileName}
                    />
                  )}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}