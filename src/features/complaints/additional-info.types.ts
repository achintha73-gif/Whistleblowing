// -------------------------------------------------------------
// Additional Information - Type Definitions
// -------------------------------------------------------------

/**
 * Information types - must match InformationType enum in Prisma.
 */
export const INFORMATION_TYPES = {
  ADDITIONAL_DETAILS: 'ADDITIONAL_DETAILS',
  CLARIFICATION: 'CLARIFICATION',
  SUPPORTING_INFO: 'SUPPORTING_INFO',
  CORRECTION: 'CORRECTION',
} as const;

export type InformationType =
  (typeof INFORMATION_TYPES)[keyof typeof INFORMATION_TYPES];

/**
 * Human-readable labels.
 */
export const INFORMATION_TYPE_LABELS: Record<InformationType, string> = {
  ADDITIONAL_DETAILS: 'Additional Details',
  CLARIFICATION: 'Clarification',
  SUPPORTING_INFO: 'Supporting Information',
  CORRECTION: 'Correction',
};

/**
 * Additional information as returned to the client.
 */
export interface AdditionalInfoDTO {
  infoId: number;
  complaintId: number;
  title: string;
  description: string;
  informationType: InformationType;
  submittedAt: Date;
  submittedBy: {
    userId: number;
    name: string;
  };
}

/**
 * Input for creating additional information.
 */
export interface CreateAdditionalInfoInput {
  complaintId: number;
  title: string;
  description: string;
  informationType: InformationType;
}