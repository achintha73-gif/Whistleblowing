// -------------------------------------------------------------
// Evidence Feature - Type Definitions
// -------------------------------------------------------------

/**
 * Categories of evidence - used for filtering/display.
 * Not enforced by DB (file_type is a string), just a UI helper.
 */
export const EVIDENCE_TYPES = [
  'Document',
  'Image',
  'Video',
  'Audio',
  'Email',
  'Screenshot',
  'Other',
] as const;

export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

/**
 * Evidence as returned to the client.
 */
export interface EvidenceDTO {
  evidenceId: number;
  caseId: number;
  fileName: string;
  fileType: string;
  description: string | null;
  uploadedAt: Date;
}

/**
 * Input for creating evidence.
 */
export interface CreateEvidenceInput {
  caseId: number;
  fileName: string;
  fileType: string;
  description?: string | null;
}