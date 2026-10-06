// -------------------------------------------------------------
// Google reCAPTCHA v2 — Server-side verification
// -------------------------------------------------------------

const VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

export interface RecaptchaVerifyResult {
  success: boolean;
  errorCodes?: string[];
}

/**
 * Verify a reCAPTCHA v2 response token with Google.
 * Returns { success: true } if the token is valid.
 *
 * The token comes from the frontend after the user clicks
 * "I'm not a robot".
 */
export async function verifyRecaptcha(
  token: string | null | undefined
): Promise<RecaptchaVerifyResult> {
  if (!token || token.trim() === '') {
    return { success: false, errorCodes: ['missing-input-response'] };
  }

  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    console.error('[recaptcha] RECAPTCHA_SECRET_KEY is missing from .env');
    return { success: false, errorCodes: ['missing-secret'] };
  }

  try {
    const params = new URLSearchParams();
    params.append('secret', secret);
    params.append('response', token);

    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!res.ok) {
      console.error('[recaptcha] Google verify returned', res.status);
      return { success: false, errorCodes: ['http-error'] };
    }

    const data = await res.json();

    if (data.success === true) {
      return { success: true };
    }

    return {
      success: false,
      errorCodes: data['error-codes'] ?? ['unknown'],
    };
  } catch (err) {
    console.error('[recaptcha] Verification failed', err);
    return { success: false, errorCodes: ['network-error'] };
  }
}