import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { requireAuth, UnauthorizedError } from '@/lib/auth';
import { addEvidenceWithFile } from '@/features/evidence/services/evidence.service';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.txt', '.csv', '.xlsx',
  '.jpg', '.jpeg', '.png', '.gif', '.webp',
  '.mp4', '.webm', '.mov',
];

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const caseId = Number(id);
    if (!Number.isInteger(caseId) || caseId <= 0) {
      return NextResponse.json({ error: 'Invalid case ID' }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const fileType = formData.get('fileType');
    const description = formData.get('description');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (typeof fileType !== 'string' || !fileType.trim()) {
      return NextResponse.json(
        { error: 'fileType is required' },
        { status: 400 }
      );
    }

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
        { error: `File type not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` },
        { status: 400 }
      );
    }

    const uuid = randomUUID();
    const safeName = sanitizeFileName(file.name);
    const storedName = `${uuid}-${safeName}`;
    const uploadDir = join(process.cwd(), 'private-uploads');
    const filePathOnDisk = join(uploadDir, storedName);

    const arrayBuffer = await file.arrayBuffer();
    await writeFile(filePathOnDisk, Buffer.from(arrayBuffer));

    const result = await addEvidenceWithFile(user, {
      caseId,
      fileName: file.name,
      fileType: fileType.trim(),
      fileSize: file.size,
      description:
        typeof description === 'string' && description.trim()
          ? description.trim()
          : null,
      filePath: storedName,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ evidence: result.evidence }, { status: 201 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    console.error('[POST /api/cases/:id/evidence/upload]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}