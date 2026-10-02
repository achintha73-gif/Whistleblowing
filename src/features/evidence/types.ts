// -------------------------------------------------------------
// Evidence Feature - Type Definitions
// -------------------------------------------------------------

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
  hasFile: boolean;
}

/**
 * Input for creating evidence (JSON metadata).
 * Kept for backward compatibility — new uploads go through FormData.
 */
export interface CreateEvidenceInput {
  caseId: number;
  fileName: string;
  fileType: string;
  description?: string | null;
}