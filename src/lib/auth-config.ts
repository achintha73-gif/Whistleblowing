// -------------------------------------------------------------
// Auth Configuration
// Centralized JWT + cookie settings
// -------------------------------------------------------------

export const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    'JWT_SECRET is missing. Add it to your .env file.'
  );
}

export const AUTH_COOKIE_NAME = 'wb_session';

// Session duration: 7 days
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

// -------------------------------------------------------------
// Email / SMTP
// -------------------------------------------------------------

export const SMTP_HOST = process.env.SMTP_HOST;
export const SMTP_PORT = Number(process.env.SMTP_PORT ?? 587);
export const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
export const SMTP_USER = process.env.SMTP_USER;
export const SMTP_PASS = process.env.SMTP_PASS;
export const SMTP_FROM = process.env.SMTP_FROM ?? SMTP_USER;

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  throw new Error(
    'SMTP configuration missing. Add SMTP_HOST, SMTP_USER, SMTP_PASS to .env'
  );
}

// -------------------------------------------------------------
// Password Reset
// -------------------------------------------------------------

export const PASSWORD_RESET_EXPIRY_SECONDS = Number(
  process.env.PASSWORD_RESET_EXPIRY_SECONDS ?? 3600
);

export const APP_URL = process.env.APP_URL ?? 'http://localhost:3000';