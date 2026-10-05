// -------------------------------------------------------------
// Reference Code Generator
// Used for anonymous complaints — user-facing tracking code.
// -------------------------------------------------------------

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no confusing chars (0, O, I, 1)

/**
 * Generate a human-readable reference code: WB-XXXX-XXXX
 * e.g., WB-A3F9-2K7L
 */
export function generateReferenceCode(): string {
  const seg1 = randomSegment(4);
  const seg2 = randomSegment(4);
  return `WB-${seg1}-${seg2}`;
}

function randomSegment(length: number): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * ALPHABET.length);
    out += ALPHABET[idx];
  }
  return out;
}

/**
 * Validate the format of a reference code.
 * Format: WB-XXXX-XXXX (uppercase, no ambiguous characters)
 */
export function isValidReferenceCode(code: string): boolean {
  return /^WB-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/.test(code);
}

/**
 * Normalize input: trim + uppercase.
 */
export function normalizeReferenceCode(input: string): string {
  return input.trim().toUpperCase();
}