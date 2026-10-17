// Date helpers that use the student's LOCAL calendar day.
// Never use new Date().toISOString().split('T')[0] for "today" — that is the UTC
// day, which is wrong for an hour every night in Lagos (UTC+1).

export function localDateStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Parses 'YYYY-MM-DD' as a local date (new Date('YYYY-MM-DD') would parse it as UTC).
export function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

// Whole calendar days from today (local) until the target date. 0 if the date has passed.
export function daysUntil(target: Date): number {
  const today = parseLocalDate(localDateStr());
  const t = parseLocalDate(localDateStr(target));
  return Math.max(0, Math.round((t.getTime() - today.getTime()) / 86400000));
}

// Monday 00:00 local time of the current week.
export function startOfWeekLocal(d: Date = new Date()): Date {
  const out = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = out.getDay(); // 0 = Sunday
  out.setDate(out.getDate() - (dow === 0 ? 6 : dow - 1));
  return out;
}

// ---- Smart defaults ----

// Nigerian universities usually run First Semester from about September to February
// and Second Semester from about March to August.
export function likelySemesterNumber(d: Date = new Date()): 1 | 2 {
  const m = d.getMonth() + 1; // 1–12
  return m >= 9 || m <= 2 ? 1 : 2;
}

// WAEC/NECO/JAMB sittings happen in the first half of the year, so from July
// onwards the next sitting is next year.
export function likelyExamYear(d: Date = new Date()): number {
  return d.getMonth() + 1 >= 7 ? d.getFullYear() + 1 : d.getFullYear();
}

// A sensible pre-filled target date, N weeks from today, as YYYY-MM-DD.
export function weeksFromToday(weeks: number): string {
  return localDateStr(addDays(new Date(), weeks * 7));
}
