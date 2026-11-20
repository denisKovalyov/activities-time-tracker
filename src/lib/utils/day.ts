// YYYY-MM-DD in the user's time zone. The database turns it into exact
// day boundaries, so JS never has to.
export type Day = string;

export const isValidTimeZone = (timeZone: string) => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
};

// The calendar day of the moment in the given time zone, e.g. 23:30 UTC on
// Nov 20 is already Nov 21 in Kyiv
export const toDay = (date: Date, timeZone: string): Day => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;

  return `${get('year')}-${get('month')}-${get('day')}`;
};

// Day arithmetic is done in UTC, where every day has exactly 24 hours,
// so DST changes in the user's time zone can't shift the result.
const parseUtcDay = (day: Day) => new Date(`${day}T00:00:00Z`);
const toUtcDay = (date: Date): Day => date.toISOString().slice(0, 10);

export const addDays = (day: Day, amount: number): Day => {
  const date = parseUtcDay(day);
  date.setUTCDate(date.getUTCDate() + amount);
  return toUtcDay(date);
};

// Weeks start on Monday
export const getWeekStart = (day: Day): Day => {
  const daysSinceMonday = (parseUtcDay(day).getUTCDay() + 6) % 7;
  return addDays(day, -daysSinceMonday);
};

export const getMonthStart = (day: Day): Day => `${day.slice(0, 8)}01`;

// E.g. "Nov 15, 2026". Formatted in UTC, where it was parsed, so the local
// time zone can't shift it to another day.
export const formatReadableDate = (
  day: Day,
  dateStyle: Intl.DateTimeFormatOptions['dateStyle'] = 'medium',
) =>
  new Intl.DateTimeFormat('en-US', { dateStyle, timeZone: 'UTC' }).format(
    parseUtcDay(day),
  );
