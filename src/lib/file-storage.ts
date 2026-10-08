import { put, del } from '@vercel/blob';

/**
 * File storage abstraction.
 *
 * In production (Vercel), files are stored in Vercel Blob.
 * The returned URL is what gets persisted in DB (`file_path` column).
 */

const PRIVATE_ACCESS = 'private' as const;

/**
 * Upload a file buffer to storage.
 * Returns the URL to store in the DB.
 */
export async function uploadFile(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const blob = await put(filename, buffer, {
    access: PRIVATE_ACCESS,
    contentType,
    addRandomSuffix: true,
  });

  return blob.url;
}

/**
 * Delete a file from storage.
 * Accepts the URL stored in DB.
 */
export async function deleteFile(filePathOrUrl: string): Promise<void> {
  try {
    // Only delete if it looks like a blob URL
    if (filePathOrUrl.startsWith('https://')) {
      await del(filePathOrUrl);
    }
  } catch (err) {
    // Don't fail the caller if delete fails (file may already be gone)
    console.error('[file-storage] deleteFile failed:', err);
  }
}

/**
 * Check if a stored path is a full URL (blob) vs legacy local filename.
 */
export function isBlobUrl(path: string): boolean {
  return path.startsWith('https://');
}