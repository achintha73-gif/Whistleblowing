import { Info } from 'lucide-react';
import {
  INFORMATION_TYPE_LABELS,
} from '../additional-info.types';
import type { AdditionalInfoDTO } from '../additional-info.types';

const TYPE_COLORS: Record<string, string> = {
  ADDITIONAL_DETAILS: 'bg-blue-100 text-blue-800 border-blue-200',
  CLARIFICATION: 'bg-amber-100 text-amber-800 border-amber-200',
  SUPPORTING_INFO: 'bg-green-100 text-green-800 border-green-200',
  CORRECTION: 'bg-red-100 text-red-800 border-red-200',
};

export function AdditionalInfoList({
  items,
}: {
  items: AdditionalInfoDTO[];
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <Info className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">
          No additional information submitted yet.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const badgeClass =
          TYPE_COLORS[item.informationType] ??
          'bg-gray-100 text-gray-700 border-gray-200';

        return (
          <li
            key={item.infoId}
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <h4 className="text-sm font-semibold text-gray-900">
                {item.title}
              </h4>
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${badgeClass}`}
              >
                {INFORMATION_TYPE_LABELS[item.informationType] ??
                  item.informationType}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {item.description}
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Added by{' '}
              <span className="font-medium text-gray-700">
                {item.submittedBy.name}
              </span>{' '}
              ·{' '}
              {new Date(item.submittedAt).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </li>
        );
      })}
    </ul>
  );
}