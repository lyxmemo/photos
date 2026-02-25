/**
 * Parses flexible date strings ("1946", "1946-01", "1946-01-01") into
 * comparable timestamps. Returns Infinity for null/empty so dateless
 * photos sort to the end.
 */
export function parseDateForSort(date: string | null): number {
  if (!date) return Infinity;

  const trimmed = date.trim();
  if (!trimmed) return Infinity;

  // "YYYY" -> Jan 1 of that year
  if (/^\d{4}$/.test(trimmed)) {
    return new Date(`${trimmed}-01-01`).getTime();
  }
  // "YYYY-MM" -> 1st of that month
  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    return new Date(`${trimmed}-01`).getTime();
  }
  // "YYYY-MM-DD" or other parseable date
  const ts = new Date(trimmed).getTime();
  return isNaN(ts) ? Infinity : ts;
}
