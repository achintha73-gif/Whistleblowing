import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/db';
import {
  generateReferenceCode,
  isValidReferenceCode,
} from '@/lib/reference-code';
import { verifyRecaptcha } from '@/lib/recaptcha';

/**
 * POST /api/public/report
 * PUBLIC endpoint — no auth required.
 *
 * Body: multipart/form-data with:
 *   - title: string
 *   - description: string
 *   - category?: string
 *   - recaptchaToken: string
 *   - files?: File[] (multiple, key "files")
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 5;

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

function inferFileType(ext: string): string {
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) return 'Image';
  if (['.mp4', '.webm', '.mov'].includes(ext)) return 'Video';
  if (['.pdf', '.doc', '.docx', '.txt', '.csv', '.xlsx'].includes(ext))
    return 'Document';
  return 'Other';
}

async function generateUniqueReferenceCode(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = generateReferenceCode();
    if (!isValidReferenceCode(code)) continue;
    const existing = await prisma.complaint.findUnique({
      where: { reference_code: code },
      select: { complaint_id: true },
    });
    if (!existing) return code;
  }
  throw new Error('Could not generate unique reference code');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // ── reCAPTCHA verification ─────────────────────────────
    const recaptchaToken = String(formData.get('recaptchaToken') ?? '').trim();
    const captcha = await verifyRecaptcha(recaptchaToken);

    if (!captcha.success) {
      return NextResponse.json(
        {
          error:
            'reCAPTCHA verification failed. Please try again or refresh the page.',
          codes: captcha.errorCodes,
        },
        { status: 400 }
      );
    }

    const title = String(formData.get('title') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const category = String(formData.get('category') ?? '').trim() || null;

    // ── Validation ─────────────────────────────────────────
    if (title.length < 5) {
      return NextResponse.json(
        { error: 'Title must be at least 5 characters' },
        { status: 400 }
      );
    }
    if (title.length > 200) {
      return NextResponse.json(
        { error: 'Title is too long' },
        { status: 400 }
      );
    }
    if (description.length < 20) {
      return NextResponse.json(
        { error: 'Description must be at least 20 characters' },
        { status: 400 }
      );
    }
    if (description.length > 5000) {
      return NextResponse.json(
        { error: 'Description is too long' },
        { status: 400 }
      );
    }

    // ── Files ──────────────────────────────────────────────
    const files = formData.getAll('files').filter((f): f is File => f instanceof File);
    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES} files allowed` },
        { status: 400 }
      );
    }

    for (const f of files) {
      if (f.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `"${f.name}" is too large (max 5 MB)` },
          { status: 400 }
        );
      }
      const ext = getExtension(f.name);
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return NextResponse.json(
          { error: `File type "${ext}" is not allowed` },
          { status: 400 }
        );
      }
    }

    // ── Create ─────────────────────────────────────────────
    const referenceCode = await generateUniqueReferenceCode();

    const complaint = await prisma.complaint.create({
      data: {
        title,
        description,
        category,
        status: 'PENDING',
        isAnonymous: true,
        user_id: null,
        reference_code: referenceCode,
      },
    });

    const uploadDir = join(process.cwd(), 'private-uploads');
    for (const f of files) {
      const uuid = randomUUID();
      const safeName = sanitizeFileName(f.name);
      const storedName = `${uuid}-${safeName}`;
      const filePathOnDisk = join(uploadDir, storedName);

      const arrayBuffer = await f.arrayBuffer();
      await writeFile(filePathOnDisk, Buffer.from(arrayBuffer));

      const ext = getExtension(f.name);
      await prisma.evidence.create({
        data: {
          complaint_id: complaint.complaint_id,
          case_id: null,
          file_name: f.name,
          file_type: inferFileType(ext),
          file_size: f.size,
          description: null,
          file_path: storedName,
          uploaded_by: null,
        },
      });
    }

    return NextResponse.json(
      {
        complaintId: complaint.complaint_id,
        referenceCode,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[POST /api/public/report]', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}