'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Upload, X } from 'lucide-react';
import { EVIDENCE_TYPES } from '../types';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_EXTS = [
  '.pdf', '.doc', '.docx', '.txt', '.csv', '.xlsx',
  '.jpg', '.jpeg', '.png', '.gif', '.webp',
  '.mp4', '.webm', '.mov',
];

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getExt(name: string): string {
  const idx = name.lastIndexOf('.');
  return idx >= 0 ? name.slice(idx).toLowerCase() : '';
}

export function AddEvidenceForm({ caseId }: { caseId: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string>('Document');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setError(null);
    const f = e.target.files?.[0];
    if (!f) {
      setFile(null);
      return;
    }

    if (f.size > MAX_SIZE) {
      setError(`File is too large. Maximum size is 5 MB.`);
      setFile(null);
      e.target.value = '';
      return;
    }

    const ext = getExt(f.name);
    if (!ALLOWED_EXTS.includes(ext)) {
      setError(`File type "${ext || 'unknown'}" is not allowed.`);
      setFile(null);
      e.target.value = '';
      return;
    }

    setFile(f);
  }

  function resetForm() {
    setFile(null);
    setFileType('Document');
    setDescription('');
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', fileType);
      formData.append('description', description.trim());

      const res = await fetch(`/api/cases/${caseId}/evidence/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Upload failed');
        setLoading(false);
        return;
      }

      resetForm();
      setOpen(false);
      setLoading(false);
      router.refresh();
    } catch {
      setError('Network error');
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
      >
        <Plus className="h-4 w-4" />
        Add Evidence
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 space-y-3 w-full"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Upload Evidence
        </h3>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            resetForm();
          }}
          className="text-gray-400 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* File input */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          File <span className="text-red-500">*</span>
        </label>
        <input
          type="file"
          required
          onChange={handleFileChange}
          accept={ALLOWED_EXTS.join(',')}
          className="block w-full text-sm text-gray-900 file:mr-3 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-700 file:cursor-pointer"
        />
        <p className="mt-1 text-xs text-gray-500">
          Max 5 MB · PDF, DOC, DOCX, TXT, CSV, XLSX, JPG, PNG, GIF, WEBP, MP4, WEBM, MOV
        </p>
        {file && (
          <div className="mt-2 flex items-center gap-2 rounded-md bg-green-50 border border-green-200 p-2 text-xs text-green-800">
            <Upload className="h-3.5 w-3.5" />
            <span className="font-medium truncate">{file.name}</span>
            <span className="text-green-600">({formatSize(file.size)})</span>
          </div>
        )}
      </div>

      {/* File type */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Evidence type <span className="text-red-500">*</span>
        </label>
        <select
          value={fileType}
          onChange={(e) => setFileType(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
        >
          {EVIDENCE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what this evidence contains and why it matters."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            resetForm();
          }}
          disabled={loading}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !file}
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:bg-blue-400"
        >
          <Upload className="h-3.5 w-3.5" />
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </form>
  );
}