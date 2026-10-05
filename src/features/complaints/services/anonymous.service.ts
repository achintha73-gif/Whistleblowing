import { prisma } from '@/lib/db';

// ============================================================
// Reference Code Generation
// ============================================================

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateRandomCode(length: number = 6): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
  }
  return code;
}

async function generateUniqueReferenceCode(): Promise<string> {
  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = `WB-${year}-${generateRandomCode()}`;
    const existing = await prisma.complaint.findUnique({
      where: { reference_code: code },
      select: { complaint_id: true },
    });
    if (!existing) return code;
  }
  throw new Error('Failed to generate unique reference code');
}

// ============================================================
// Anonymous Complaint Creation
// ============================================================

export interface AnonymousComplaintInput {
  title: string;
  description: string;
  category?: string | null;
}

export interface AnonymousComplaintSuccess {
  success: true;
  complaintId: number;
  referenceCode: string;
}

export interface AnonymousComplaintError {
  success: false;
  error: string;
}

export async function createAnonymousComplaint(
  input: AnonymousComplaintInput
): Promise<AnonymousComplaintSuccess | AnonymousComplaintError> {
  try {
    const referenceCode = await generateUniqueReferenceCode();

    const created = await prisma.complaint.create({
      data: {
        title: input.title.trim(),
        description: input.description.trim(),
        category: input.category?.trim() || null,
        isAnonymous: true,
        user_id: null,
        reference_code: referenceCode,
      },
    });

    return {
      success: true,
      complaintId: created.complaint_id,
      referenceCode,
    };
  } catch (error) {
    console.error('[Anonymous Complaint Service] Error:', error);
    return {
      success: false,
      error: 'Failed to submit anonymous complaint',
    };
  }
}

// ============================================================
// Track Complaint by Reference Code
// ============================================================

export interface TrackedComplaint {
  complaintId: number;
  referenceCode: string;
  title: string;
  description: string;
  category: string | null;
  status: string;
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
  additionalInfo: Array<{
    infoId: number;
    title: string;
    description: string;
    informationType: string;
    submittedAt: Date;
  }>;
}

export async function trackComplaintByCode(
  code: string
): Promise<TrackedComplaint | null> {
  const normalized = code.trim().toUpperCase();

  const complaint = await prisma.complaint.findUnique({
    where: { reference_code: normalized },
    include: {
      additionalInfo: {
        orderBy: { submitted_at: 'desc' },
        select: {
          info_id: true,
          title: true,
          description: true,
          informationType: true,
          submitted_at: true,
        },
      },
    },
  });

  if (!complaint) return null;

  return {
    complaintId: complaint.complaint_id,
    referenceCode: complaint.reference_code || '',
    title: complaint.title,
    description: complaint.description,
    category: complaint.category,
    status: complaint.status,
    isAnonymous: complaint.isAnonymous,
    createdAt: complaint.created_at,
    updatedAt: complaint.updated_at,
    additionalInfo: complaint.additionalInfo.map((info) => ({
      infoId: info.info_id,
      title: info.title,
      description: info.description,
      informationType: info.informationType,
      submittedAt: info.submitted_at,
    })),
  };
}

// ============================================================
// Add Additional Info (Anonymous)
// ============================================================

export interface AnonymousAdditionalInfoInput {
  referenceCode: string;
  title: string;
  description: string;
  informationType: string;
}

export interface AdditionalInfoSuccess {
  success: true;
  infoId: number;
}

export interface AdditionalInfoError {
  success: false;
  error: string;
}

export async function addAnonymousAdditionalInfo(
  input: AnonymousAdditionalInfoInput
): Promise<AdditionalInfoSuccess | AdditionalInfoError> {
  const normalized = input.referenceCode.trim().toUpperCase();

  const complaint = await prisma.complaint.findUnique({
    where: { reference_code: normalized },
    select: { complaint_id: true, isAnonymous: true },
  });

  if (!complaint) {
    return { success: false, error: 'Complaint not found' };
  }

  if (!complaint.isAnonymous) {
    return { success: false, error: 'This complaint is not anonymous' };
  }

  try {
    const adminUser = await prisma.user.findFirst({
      where: { role: { role_name: 'ADMIN' } },
      select: { user_id: true },
    });

    if (!adminUser) {
      return { success: false, error: 'System error: no admin user found' };
    }

    const created = await prisma.additionalInformation.create({
      data: {
        complaint_id: complaint.complaint_id,
        title: input.title.trim(),
        description: input.description.trim(),
        informationType: input.informationType as never,
        submitted_by: adminUser.user_id,
      },
    });

    return { success: true, infoId: created.info_id };
  } catch (error) {
    console.error('[Anonymous Additional Info] Error:', error);
    return {
      success: false,
      error: 'Failed to add additional information',
    };
  }
}
