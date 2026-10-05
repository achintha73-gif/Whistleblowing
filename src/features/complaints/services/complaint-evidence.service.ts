import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { prisma } from '@/lib/db';

// ============================================================
// Configuration
// ============================================================

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'complaints');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_FILES_PER_COMPLAINT = 5;

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

export interface UploadedFile {
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
}

export interface EvidenceSummary {
  evidenceId: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  description: string | null;
  uploadedAt: Date;
  uploadedBy: { userId: number; name: string } | null;
}

// ============================================================
// Upload Evidence
// ============================================================

export interface UploadEvidenceSuccess {
  success: true;
  evidence: EvidenceSummary;
}

export interface UploadEvidenceError {
  success: false;
  error: string;
}

export async function uploadComplaintEvidence(
  complaintId: number,
  userId: number,
  file: File,
  description?: string
): Promise<UploadEvidenceSuccess | UploadEvidenceError> {
  // Verify complaint exists
  const complaint = await prisma.complaint.findUnique({
    where: { complaint_id: complaintId },
    select: { complaint_id: true },
  });

  if (!complaint) {
    return { success: false, error: 'Complaint not found' };
  }

  // Check existing count
  const existingCount = await prisma.evidence.count({
    where: { complaint_id: complaintId },
  });

  if (existingCount >= MAX_FILES_PER_COMPLAINT) {
    return {
      success: false,
      error: `Maximum ${MAX_FILES_PER_COMPLAINT} files per complaint`,
    };
  }

  // Validate file
  if (!file || file.size === 0) {
    return { success: false, error: 'No file provided' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: `File too large. Maximum ${MAX_FILE_SIZE / 1024 / 1024} MB`,
    };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      success: false,
      error: 'File type not allowed. Use PDF, image, doc, or xlsx.',
    };
  }

  try {
    // Ensure directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Generate unique file name
    const ext = path.extname(file.name);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const storedName = `complaint-${complaintId}-${timestamp}-${random}${ext}`;
    const absolutePath = path.join(UPLOAD_DIR, storedName);
    const relativePath = `/uploads/complaints/${storedName}`;

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(absolutePath, buffer);

    // Save DB record
    const created = await prisma.evidence.create({
      data: {
        complaint_id: complaintId,
        uploaded_by: userId,
        file_name: file.name,
        file_type: file.type,
        file_path: relativePath,
        file_size: file.size,
        description: description?.trim() || null,
      },
      include: {
        uploader: {
          select: { user_id: true, name: true },
        },
      },
    });

    return {
      success: true,
      evidence: {
        evidenceId: created.evidence_id,
        fileName: created.file_name,
        fileType: created.file_type,
        fileSize: created.file_size ?? 0,
        description: created.description,
        uploadedAt: created.uploaded_at,
        uploadedBy: created.uploader
          ? { userId: created.uploader.user_id, name: created.uploader.name }
          : null,
      },
    };
  } catch (error) {
    console.error('[Upload Evidence] Error:', error);
    return { success: false, error: 'Failed to upload file' };
  }
}

// ============================================================
// List Evidence for Complaint
// ============================================================

export async function listComplaintEvidence(
  complaintId: number
): Promise<EvidenceSummary[]> {
  const rows = await prisma.evidence.findMany({
    where: { complaint_id: complaintId },
    orderBy: { uploaded_at: 'desc' },
    include: {
      uploader: {
        select: { user_id: true, name: true },
      },
    },
  });

  return rows.map((r) => ({
    evidenceId: r.evidence_id,
    fileName: r.file_name,
    fileType: r.file_type,
    fileSize: r.file_size ?? 0,
    description: r.description,
    uploadedAt: r.uploaded_at,
    uploadedBy: r.uploader
      ? { userId: r.uploader.user_id, name: r.uploader.name }
      : null,
  }));
}

// ============================================================
// Delete Evidence
// ============================================================

export async function deleteComplaintEvidence(
  evidenceId: number,
  userId: number,
  userRole: string
): Promise<{ success: true } | { success: false; error: string }> {
  const evidence = await prisma.evidence.findUnique({
    where: { evidence_id: evidenceId },
  });

  if (!evidence) {
    return { success: false, error: 'Evidence not found' };
  }

  // Only uploader or admin can delete
  if (userRole !== 'ADMIN' && evidence.uploaded_by !== userId) {
    return { success: false, error: 'Forbidden' };
  }

  try {
    // Delete file from disk
    if (evidence.file_path) {
      const absolutePath = path.join(
        process.cwd(),
        'public',
        evidence.file_path.replace(/^\//, '')
      );
      if (existsSync(absolutePath)) {
        await unlink(absolutePath);
      }
    }

    // Delete DB record
    await prisma.evidence.delete({
      where: { evidence_id: evidenceId },
    });

    return { success: true };
  } catch (error) {
    console.error('[Delete Evidence] Error:', error);
    return { success: false, error: 'Failed to delete evidence' };
  }
}
