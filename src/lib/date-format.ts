/**
 * Date/time formatting helpers.
 *
 * All times are rendered in Sri Lanka Standard Time (Asia/Colombo, UTC+5:30)
 * regardless of the server timezone (which is UTC on Vercel).
 */

const TZ = 'Asia/Colombo';
const LOCALE = 'en-US';

/**
 * "Oct 8, 2026, 6:50 PM" - full date + time
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString(LOCALE, {
    timeZone: TZ,
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/**
 * "Oct 8, 2026" - date only
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(LOCALE, {
    timeZone: TZ,
    dateStyle: 'medium',
  });
}

/**
 * "6:50 PM" - time only
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString(LOCALE, {
    timeZone: TZ,
    timeStyle: 'short',
  });
}

/**
 * "Oct 8, 6:50 PM" - short date + time (no year)
 */
export function formatShortDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString(LOCALE, {
    timeZone: TZ,
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * "Oct 8" - day + month only (no year)
 */
export function formatShortDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(LOCALE, {
    timeZone: TZ,
    month: 'short',
    day: 'numeric',
  });
}

/**
 * "2m ago", "1h ago", "3d ago" - relative to now.
 * Handles both past (ago) and future (in).
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return d.toLocaleDateString(LOCALE, {
    timeZone: TZ,
    month: 'short',
    day: 'numeric',
  });
}