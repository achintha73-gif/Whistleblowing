import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { requireAuth, UnauthorizedError } from '@/lib/auth';
import { getEvidenceByIdForUser } from '@/features/evidence/services/evidence.service';

/**
 * GET /api/evidence/:id/download
 * Streams the evidence file after checking permissions.
 */

const MIME_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx':
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.txt': 'text/plain',
  '.csv': 'text/csv',
  '.xlsx':
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
};

function getMimeType(fileName: string): string {
  const idx = fileName.lastIndexOf('.');
  const ext = idx >= 0 ? fileName.slice(idx).toLowerCase() : '';
  return MIME_TYPES[ext] ?? 'application/octet-stream';
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const evidenceId = Number(id);
    if (!Number.isInteger(evidenceId) || evidenceId <= 0) {
      return NextResponse.json(
        { error: 'Invalid evidence ID' },
        { status: 400 }
      );
    }

    const result = await getEvidenceByIdForUser(user, evidenceId);
    if (!result) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { evidence } = result;

    if (!evidence.filePath) {
      return NextResponse.json(
        { error: 'No file attached to this evidence' },
        { status: 404 }
      );
    }

    const filePathOnDisk = join(
      process.cwd(),
      'private-uploads',
      evidence.filePath
    );

    let fileBuffer: Buffer;
    try {
      fileBuffer = await readFile(filePathOnDisk);
    } catch {
      return NextResponse.json(
        { error: 'File not found on server' },
        { status: 404 }
      );
    }

    const mimeType = getMimeType(evidence.fileName);

    // Convert Node Buffer to Uint8Array for NextResponse
    const fileBytes = new Uint8Array(fileBuffer);

    return new NextResponse(fileBytes, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': String(fileBuffer.length),
        'Content-Disposition': `inline; filename="${encodeURIComponent(
          evidence.fileName
        )}"`,
      },
    });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    console.error('[GET /api/evidence/:id/download]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}