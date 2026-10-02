import type { SafeUser } from '@/features/auth/types';
import type {
  AdditionalInfoDTO,
  CreateAdditionalInfoInput,
  InformationType,
} from '../additional-info.types';
import * as aiRepo from '../repository/additional-info.repository';
import * as complaintRepo from '../repository/complaint.repository';

// -------------------------------------------------------------
// Prisma -> DTO
// -------------------------------------------------------------

type PrismaAIRow = {
  info_id: number;
  complaint_id: number;
  title: string;
  description: string;
  informationType: string;
  submitted_at: Date;
  submitted_by: number;
  submittedBy: {
    user_id: number;
    name: string;
  };
};

export function toAdditionalInfoDTO(row: PrismaAIRow): AdditionalInfoDTO {
  return {
    infoId: row.info_id,
    complaintId: row.complaint_id,
    title: row.title,
    description: row.description,
    informationType: row.informationType as InformationType,
    submittedAt: row.submitted_at,
    submittedBy: {
      userId: row.submittedBy.user_id,
      name: row.submittedBy.name,
    },
  };
}

// -------------------------------------------------------------
// Create
// -------------------------------------------------------------

export interface AddAdditionalInfoResult {
  success: true;
  additionalInfo: AdditionalInfoDTO;
}

export interface AddAdditionalInfoError {
  success: false;
  error: string;
}

export async function addAdditionalInfo(
  user: SafeUser,
  input: CreateAdditionalInfoInput
): Promise<AddAdditionalInfoResult | AddAdditionalInfoError> {
  const complaint = await complaintRepo.findComplaintById(input.complaintId);
  if (!complaint) {
    return { success: false, error: 'Complaint not found' };
  }

  // Permissions:
  // - USER can add to their own non-anonymous complaints
  // - USER cannot add to anonymous complaints (would deanonymize)
  // - Staff (MANAGER, INVESTIGATOR, ADMIN) can add to any complaint
  const isStaff =
    user.roleName === 'MANAGER' ||
    user.roleName === 'INVESTIGATOR' ||
    user.roleName === 'ADMIN';

  if (!isStaff) {
    if (user.roleName !== 'USER') {
      return { success: false, error: 'Forbidden' };
    }
    if (complaint.user_id !== user.userId) {
      return {
        success: false,
        error: 'You can only add info to your own complaints',
      };
    }
    if (complaint.isAnonymous) {
      return {
        success: false,
        error: 'You cannot add info to an anonymous complaint',
      };
    }
  }

  const created = await aiRepo.createAdditionalInfo({
    complaint_id: input.complaintId,
    title: input.title,
    description: input.description,
    information_type: input.informationType,
    submitted_by: user.userId,
  });

  return {
    success: true,
    additionalInfo: toAdditionalInfoDTO(created as PrismaAIRow),
  };
}

// -------------------------------------------------------------
// List
// -------------------------------------------------------------

export async function getAdditionalInfoForComplaint(
  user: SafeUser,
  complaintId: number
): Promise<AdditionalInfoDTO[]> {
  const complaint = await complaintRepo.findComplaintById(complaintId);
  if (!complaint) return [];

  const isStaff =
    user.roleName === 'MANAGER' ||
    user.roleName === 'INVESTIGATOR' ||
    user.roleName === 'ADMIN';

  // Access control
  if (!isStaff) {
    // Only own complaints (non-anonymous)
    if (complaint.user_id !== user.userId) {
      return [];
    }
  }

  const rows = await aiRepo.listAdditionalInfoForComplaint(complaintId);
  return rows.map((r) => toAdditionalInfoDTO(r as PrismaAIRow));
}