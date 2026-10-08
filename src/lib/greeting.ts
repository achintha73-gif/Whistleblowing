/**
 * Time-of-day greeting based on Sri Lanka time (Asia/Colombo).
 * Server (Vercel) runs in UTC, so we explicitly convert.
 */
export function getGreeting(): string {
  const hour = Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Colombo',
      hour: 'numeric',
      hour12: false,
    }).format(new Date())
  );

  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}