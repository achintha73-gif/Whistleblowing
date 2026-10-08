import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, UnauthorizedError } from '@/lib/auth';
import { addComplaintEvidence } from '@/features/evidence/services/evidence.service';
import { prisma } from '@/lib/db';
import { uploadFile } from '@/lib/file-storage';

/**
 * POST /api/complaints/upload
 *
 * Body: multipart/form-data with:
 *   - file: File
 *   - complaintId: string
 *   - fileType?: string (defaults to inferred)
 *   - description?: string
 *
 * Uploads a file attached to a complaint (employee-submitted).
 * Files are stored in Vercel Blob (production) - the returned URL
 * is persisted in `evidence.file_path`.
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.txt', '.csv', '.xlsx',
  '.jpg', '.jpeg', '.png', '.gif', '.webp',
  '.mp4', '.webm', '.mov',
];

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

function sanitizeFileName(name: string): string {
  return name
    .replace(/[\\/]/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 200);
}

function getExtension(name: string): string {
  const idx = name.lastIndexOf('.');
  return idx >= 0 ? name.slice(idx).toLowerCase() : '';
}

function inferFileType(ext: string): string {
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) return 'Image';
  if (['.mp4', '.webm', '.mov'].includes(ext)) return 'Video';
  if (['.pdf', '.doc', '.docx', '.txt', '.csv', '.xlsx'].includes(ext))
    return 'Document';
  return 'Other';
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const formData = await request.formData();
    const file = formData.get('file');
    const complaintIdRaw = formData.get('complaintId');
    const fileTypeRaw = formData.get('fileType');
    const descriptionRaw = formData.get('description');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const complaintId = Number(complaintIdRaw);
    if (!Number.isInteger(complaintId) || complaintId <= 0) {
      return NextResponse.json(
        { error: 'Invalid complaint ID' },
        { status: 400 }
      );
    }

    // Check complaint exists and belongs to user
    const complaint = await prisma.complaint.findUnique({
      where: { complaint_id: complaintId },
      select: { user_id: true, isAnonymous: true },
    });

    if (!complaint) {
      return NextResponse.json(
        { error: 'Complaint not found' },
        { status: 404 }
      );
    }

    if (user.roleName === 'USER' && complaint.user_id !== user.userId) {
      return NextResponse.json(
        { error: 'You can only attach files to your own complaints' },
        { status: 403 }
      );
    }

    if (user.roleName !== 'USER') {
      return NextResponse.json(
        { error: 'Only employees can attach files to complaints' },
        { status: 403 }
      );
    }

    // File size check
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5 MB.' },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json({ error: 'File is empty' }, { status: 400 });
    }

    const ext = getExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        {
          error: `File type not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const uuid = crypto.randomUUID();
    const safeName = sanitizeFileName(file.name);
    const storedName = `complaint-evidence/${uuid}-${safeName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';

    const fileUrl = await uploadFile(buffer, storedName, contentType);

    // Determine file type (explicit > inferred)
    const fileType =
      typeof fileTypeRaw === 'string' && fileTypeRaw.trim()
        ? fileTypeRaw.trim()
        : inferFileType(ext);

    const description =
      typeof descriptionRaw === 'string' && descriptionRaw.trim()
        ? descriptionRaw.trim()
        : null;

    // Create evidence row with blob URL
    const result = await addComplaintEvidence({
      complaintId,
      fileName: file.name,
      fileType,
      fileSize: file.size,
      description,
      filePath: fileUrl,
      uploadedBy: user.userId,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ evidence: result.evidence }, { status: 201 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    console.error('[POST /api/complaints/upload]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}