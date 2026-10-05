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
 * `source` tells whether it was uploaded by an employee (complaint)
 * or by an investigator (case).
 */
export interface EvidenceDTO {
  evidenceId: number;
  // Context
  complaintId: number | null;
  caseId: number | null;
  source: 'complaint' | 'case';
  // File info
  fileName: string;
  fileType: string;
  fileSize: number | null;
  description: string | null;
  uploadedAt: Date;
  hasFile: boolean;
  // Who uploaded
  uploadedBy: {
    userId: number;
    name: string;
    roleName: string;
  } | null;
}

/**
 * Input for creating evidence from a complaint (employee upload).
 */
export interface CreateComplaintEvidenceInput {
  complaintId: number;
  fileName: string;
  fileType: string;
  fileSize: number | null;
  description?: string | null;
  filePath: string;
  uploadedBy: number | null;
}