import { NextRequest, NextResponse } from 'next/server';
import { head } from '@vercel/blob';
import { requireAuth, UnauthorizedError } from '@/lib/auth';
import { getEvidenceByIdForUser } from '@/features/evidence/services/evidence.service';

/**
 * GET /api/evidence/:id/download
 *
 * Auth check first, then fetch the blob from Vercel Blob storage.
 * Private blobs cannot be accessed directly, so we stream them
 * back to the authenticated user.
 */

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

    // Blob URL case - fetch from Vercel Blob
    if (evidence.filePath.startsWith('https://')) {
      try {
        // head() gives us the blob metadata + downloadable URL
        const blobMeta = await head(evidence.filePath);

        // Private blobs require auth headers on download;
        // the blob URL can be streamed via server-side fetch using
        // the BLOB_READ_WRITE_TOKEN.
        const blobRes = await fetch(blobMeta.url, {
          headers: {
            Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
          },
        });

        if (!blobRes.ok) {
          return NextResponse.json(
            { error: 'File not found in storage' },
            { status: 404 }
          );
        }

        const fileBuffer = await blobRes.arrayBuffer();

        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            'Content-Type':
              blobMeta.contentType ?? 'application/octet-stream',
            'Content-Length': String(blobMeta.size),
            'Content-Disposition': `inline; filename="${encodeURIComponent(
              evidence.fileName
            )}"`,
            'Cache-Control': 'private, max-age=0, must-revalidate',
          },
        });
      } catch (err) {
        console.error('[evidence/download] Blob fetch failed:', err);
        return NextResponse.json(
          { error: 'File not found in storage' },
          { status: 404 }
        );
      }
    }

    // Legacy local file path (from before migration)
    return NextResponse.json(
      {
        error:
          'This file was stored before the storage migration. Please re-upload.',
      },
      { status: 410 }
    );
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