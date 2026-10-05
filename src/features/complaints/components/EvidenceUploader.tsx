'use client';

import { useState, useRef, ChangeEvent } from 'react';
import {
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 5;

export interface PendingFile {
  file: File;
  id: string;
}

interface EvidenceUploaderProps {
  files: PendingFile[];
  onFilesChange: (files: PendingFile[]) => void;
  maxFiles?: number;
}

const ALLOWED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return ImageIcon;
  if (type.includes('spreadsheet') || type.includes('excel')) return FileSpreadsheet;
  return FileText;
}

export function EvidenceUploader({
  files,
  onFilesChange,
  maxFiles = MAX_FILES,
}: EvidenceUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function validateAndAdd(incoming: FileList | File[]) {
    setError(null);
    const incomingArr = Array.from(incoming);

    if (files.length + incomingArr.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const valid: PendingFile[] = [];
    for (const f of incomingArr) {
      if (f.size > MAX_FILE_SIZE) {
        setError(`"${f.name}" is too large (max 5 MB)`);
        return;
      }
      if (!ALLOWED_TYPES.includes(f.type)) {
        setError(`"${f.name}" has an unsupported file type`);
        return;
      }
      valid.push({
        file: f,
        id: `${f.name}-${f.size}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
      });
    }

    onFilesChange([...files, ...valid]);
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      validateAndAdd(e.target.files);
      e.target.value = '';
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      validateAndAdd(e.dataTransfer.files);
    }
  }

  function removeFile(id: string) {
    onFilesChange(files.filter((f) => f.id !== id));
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Paperclip className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-800">
          Attach Evidence
        </span>
        <span className="text-xs text-gray-500">(optional)</span>
      </div>

      {error && (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-5 text-center transition ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/40'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,image/*,.doc,.docx,.xls,.xlsx,.txt"
          onChange={handleInputChange}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <Paperclip className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-sm font-medium text-gray-700">
            {isDragging ? 'Drop files here' : 'Drag and drop files here'}
          </p>
          <p className="text-xs text-gray-500">
            or click to browse - PDF, images, docs - max 5 MB each
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((f) => {
            const Icon = getFileIcon(f.file.type);
            return (
              <li
                key={f.id}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-2.5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800">
                    {f.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatBytes(f.file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(f.id)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remove ${f.file.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {files.length > 0 && (
        <p className="mt-2 text-xs text-gray-500">
          {files.length}/{maxFiles} file{files.length === 1 ? '' : 's'} selected
        </p>
      )}
    </div>
  );
}