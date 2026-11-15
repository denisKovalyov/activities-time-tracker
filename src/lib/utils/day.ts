// A calendar day in the user's time zone, formatted as YYYY-MM-DD.
// Days are plain strings on purpose: the database turns them into exact
// day boundaries using the user's time zone, so JS never has to.
export type Day = string;

export const isValidTimeZone = (timeZone: string) => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
};

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
const parseDay = (day: Day) => new Date(`${day}T00:00:00Z`);
const formatDay = (date: Date): Day => date.toISOString().slice(0, 10);

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// The round trip rejects days that don't exist, e.g. 2026-02-30.
export const isDay = (value: string): value is Day => {
  if (!DAY_PATTERN.test(value)) return false;
  const date = parseDay(value);
  return !Number.isNaN(date.getTime()) && formatDay(date) === value;
};

export const addDays = (day: Day, amount: number): Day => {
  const date = parseDay(day);
  date.setUTCDate(date.getUTCDate() + amount);
  return formatDay(date);
};

// Weeks start on Monday.
export const getWeekStart = (day: Day): Day => {
  const daysSinceMonday = (parseDay(day).getUTCDay() + 6) % 7;
  return addDays(day, -daysSinceMonday);
};

export const getMonthStart = (day: Day): Day => `${day.slice(0, 8)}01`;

// E.g. "Nov 15, 2026". The day is formatted in UTC, where it was parsed, so
// the time zone of the browser or server can't shift it to another day.
export const formatReadableDay = (
  day: Day,
  dateStyle: Intl.DateTimeFormatOptions['dateStyle'] = 'medium',
) =>
  new Intl.DateTimeFormat('en-US', { dateStyle, timeZone: 'UTC' }).format(
    parseDay(day),
  );
