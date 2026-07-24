/** UTC window start. `alltime` → null (no lower bound). */
export function windowStartUtc(
  window: 'day' | 'week' | 'alltime',
  now: Date = new Date()
): Date | null {
  if (window === 'alltime') return null;
  const d = new Date(now);
  if (window === 'day') {
    return new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
    );
  }
  const day = d.getUTCDay();
  const daysFromMonday = (day + 6) % 7;
  return new Date(
    Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate() - daysFromMonday
    )
  );
}
