// -------------------------------------------------------------
// Auth Configuration
// Centralized JWT + cookie settings
// -------------------------------------------------------------

export const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    'JWT_SECRET is missing. Add it to your .env file. ' +
    'Generate one with: node -e "console.log(require(crypto).randomBytes(64).toString(hex))"'
  );
}

export const AUTH_COOKIE_NAME = 'wb_session';

// Session duration: 7 days
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
