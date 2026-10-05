'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Paperclip, X, Upload } from 'lucide-react';
import { COMPLAINT_CATEGORIES } from '../types';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_FILES = 5;

const ALLOWED_EXTS = [
  '.pdf', '.doc', '.docx', '.txt', '.csv', '.xlsx',
  '.jpg', '.jpeg', '.png', '.gif', '.webp',
  '.mp4', '.webm', '.mov',
];

interface SelectedFile {
  id: string;
  file: File;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getExt(name: string): string {
  const idx = name.lastIndexOf('.');
  return idx >= 0 ? name.slice(idx).toLowerCase() : '';
}

export function SubmitComplaintForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setError(null);
    const incoming = Array.from(e.target.files ?? []);
    e.target.value = '';

    const next: SelectedFile[] = [...files];

    for (const f of incoming) {
      if (next.length >= MAX_FILES) {
        setError(`Maximum ${MAX_FILES} files allowed`);
        break;
      }
      if (f.size > MAX_FILE_SIZE) {
        setError(`"${f.name}" is too large (max 5 MB)`);
        continue;
      }
      const ext = getExt(f.name);
      if (!ALLOWED_EXTS.includes(ext)) {
        setError(`"${f.name}" type not allowed`);
        continue;
      }
      // Skip duplicates
      if (next.some((sf) => sf.file.name === f.name && sf.file.size === f.size)) {
        continue;
      }
      next.push({
        id: `${f.name}-${f.size}-${Date.now()}-${Math.random()}`,
        file: f,
      });
    }

    setFiles(next);
  }

  function removeFile(id: string) {
    setFiles(files.filter((f) => f.id !== id));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (title.trim().length < 5) {
      setError('Title must be at least 5 characters');
      return;
    }
    if (description.trim().length < 20) {
      setError('Description must be at least 20 characters');
      return;
    }

    setLoading(true);
    setProgress(files.length > 0 ? 'Creating complaint...' : null);

    try {
      // ── Step 1: create complaint ───────────────────────
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category: category || null,
          isAnonymous,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit complaint');
        setLoading(false);
        setProgress(null);
        return;
      }

      const complaintId = data.complaint.complaintId;

      // ── Step 2: upload files (one by one) ──────────────
      let uploadedCount = 0;
      for (const sf of files) {
        setProgress(
          `Uploading file ${uploadedCount + 1} of ${files.length}: ${sf.file.name}`
        );

        const fd = new FormData();
        fd.append('file', sf.file);
        fd.append('complaintId', String(complaintId));
        fd.append('description', '');

        const upRes = await fetch('/api/complaints/upload', {
          method: 'POST',
          body: fd,
        });

        if (!upRes.ok) {
          // Complaint already created — don't block redirect
          console.error('File upload failed', sf.file.name);
        }
        uploadedCount++;
      }

      // ── Redirect ───────────────────────────────────────
      setProgress('Done!');
      router.push(`/dashboard/complaints/${complaintId}`);
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
      setProgress(null);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none disabled:bg-gray-50"
          placeholder="Brief summary of your concern"
        />
        <p className="mt-1 text-xs text-gray-500">Minimum 5 characters</p>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={loading}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none disabled:bg-gray-50"
        >
          <option value="">Select a category (optional)</option>
          {COMPLAINT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          required
          rows={8}
          maxLength={5000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none disabled:bg-gray-50"
          placeholder="Describe the situation in detail. Include dates, people involved, and any relevant information."
        />
        <p className="mt-1 text-xs text-gray-500">
          Minimum 20 characters. Be as detailed as possible.
        </p>
      </div>

      {/* Attach Evidence */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
            <Paperclip className="h-4 w-4" />
            Attach Evidence
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <span className="text-xs text-gray-500">
            {files.length} / {MAX_FILES} files
          </span>
        </div>

        <label
          htmlFor="evidence-files"
          className={`block rounded-lg border-2 border-dashed p-6 text-center transition cursor-pointer ${
            loading
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
              : 'border-blue-300 bg-blue-50/30 hover:border-blue-500 hover:bg-blue-50'
          }`}
        >
          <input
            id="evidence-files"
            type="file"
            multiple
            disabled={loading}
            onChange={handleFileChange}
            accept={ALLOWED_EXTS.join(',')}
            className="hidden"
          />
          <Upload className="mx-auto h-8 w-8 text-blue-500 mb-2" />
          <p className="text-sm font-medium text-gray-700">
            Drag and drop files here
          </p>
          <p className="text-xs text-gray-500 mt-1">
            or click to browse · PDF, images, docs · max 5 MB each
          </p>
        </label>

        {/* Selected files */}
        {files.length > 0 && (
          <ul className="mt-3 space-y-2">
            {files.map((sf) => (
              <li
                key={sf.id}
                className="flex items-center gap-3 rounded-md border border-gray-200 bg-white p-2"
              >
                <Paperclip className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="flex-1 truncate text-sm text-gray-700">
                  {sf.file.name}
                </span>
                <span className="text-xs text-gray-500 shrink-0">
                  {formatSize(sf.file.size)}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(sf.id)}
                  disabled={loading}
                  className="text-gray-400 hover:text-red-600 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Anonymous toggle */}
      <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            disabled={loading}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <span className="block text-sm font-medium text-gray-900">
              Submit anonymously
            </span>
            <span className="block text-xs text-gray-600 mt-0.5">
              Your name and email will not be linked to this complaint. Your
              identity will not be visible to anyone in the system.
            </span>
          </div>
        </label>
      </div>

      {/* Progress */}
      {progress && (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
          {progress}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          {loading ? 'Submitting...' : 'Submit Complaint'}
        </button>
      </div>
    </form>
  );
}