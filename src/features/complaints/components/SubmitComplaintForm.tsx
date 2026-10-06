'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Paperclip,
  X,
  Upload,
  AlertCircle,
  Loader2,
  Type,
  Tag,
  FileText,
  Shield,
  Check,
} from 'lucide-react';
import { COMPLAINT_CATEGORIES } from '../types';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
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
          console.error('File upload failed', sf.file.name);
        }
        uploadedCount++;
      }

      setProgress('Done!');
      router.push(`/dashboard/complaints/${complaintId}`);
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
      setProgress(null);
    }
  }

  const descriptionCount = description.length;
  const titleCount = title.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700"
        >
          <Type className="h-3.5 w-3.5 text-gray-400" />
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
          className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="Brief summary of your concern"
        />
        <div className="mt-1.5 flex items-center justify-between text-xs">
          <span className="text-gray-500">Minimum 5 characters</span>
          <span className="text-gray-400">{titleCount}/200</span>
        </div>
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor="category"
          className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700"
        >
          <Tag className="h-3.5 w-3.5 text-gray-400" />
          Category
          <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={loading}
          className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-3 text-sm text-gray-900 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">Select a category</option>
          {COMPLAINT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700"
        >
          <FileText className="h-3.5 w-3.5 text-gray-400" />
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
          className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="Describe the situation in detail. Include dates, people involved, and any relevant information."
        />
        <div className="mt-1.5 flex items-center justify-between text-xs">
          <span className="text-gray-500">
            Minimum 20 characters. Be as detailed as possible.
          </span>
          <span className="text-gray-400">{descriptionCount}/5000</span>
        </div>
      </div>

      {/* Attach Evidence */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
            <Paperclip className="h-4 w-4 text-gray-400" />
            Attach Evidence
            <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <span className="text-xs text-gray-500">
            {files.length} / {MAX_FILES} files
          </span>
        </div>

        <label
          htmlFor="evidence-files"
          className={`block cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition ${
            loading
              ? 'cursor-not-allowed border-gray-200 bg-gray-50'
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
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
            <Upload className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm font-semibold text-gray-800">
            Drag and drop files here
          </p>
          <p className="mt-1 text-xs text-gray-500">
            or click to browse · PDF, images, docs · max 5 MB each
          </p>
        </label>

        {files.length > 0 && (
          <ul className="mt-3 space-y-2">
            {files.map((sf) => (
              <li
                key={sf.id}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-2.5 transition hover:border-blue-300"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Paperclip className="h-4 w-4" />
                </div>
                <span className="flex-1 truncate text-sm font-medium text-gray-700">
                  {sf.file.name}
                </span>
                <span className="shrink-0 text-xs text-gray-500">
                  {formatSize(sf.file.size)}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(sf.id)}
                  disabled={loading}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Anonymous toggle — card style */}
      <div
        className={`rounded-2xl border p-4 transition ${
          isAnonymous
            ? 'border-blue-300 bg-blue-50/60'
            : 'border-gray-200 bg-gray-50/60'
        }`}
      >
        <label className="flex cursor-pointer items-start gap-3">
          <span className="relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              disabled={loading}
              className="peer sr-only"
            />
            <span
              className={`absolute inset-0 rounded-full transition ${
                isAnonymous ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gray-300'
              }`}
            />
            <span
              className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                isAnonymous ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </span>
          <div className="min-w-0">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
              <Shield className="h-4 w-4 text-blue-600" />
              Submit anonymously
            </span>
            <span className="mt-0.5 block text-xs text-gray-600">
              Your name and email will not be linked to this complaint. Your
              identity will not be visible to anyone in the system.
            </span>
          </div>
        </label>
      </div>

      {/* Progress */}
      {progress && (
        <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span>{progress}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Submit Complaint
            </>
          )}
        </button>
      </div>
    </form>
  );
}