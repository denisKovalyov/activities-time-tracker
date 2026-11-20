import { describe, it, expect } from 'vitest';

import {
  addDays,
  formatReadableDate,
  getMonthStart,
  getWeekStart,
  isValidTimeZone,
  toDay,
} from '../day';

describe('day', () => {
  describe('toDay', () => {
    // 2026-11-15 22:30 UTC
    const date = new Date(Date.UTC(2026, 10, 15, 22, 30));

    it('returns the calendar day in the given time zone', () => {
      expect(toDay(date, 'UTC')).toBe('2026-11-15');
      expect(toDay(date, 'Europe/Kyiv')).toBe('2026-11-16');
      expect(toDay(date, 'America/New_York')).toBe('2026-11-15');
    });

    it('pads month and day with zeros', () => {
      expect(toDay(new Date(Date.UTC(2026, 0, 5, 12)), 'UTC')).toBe(
        '2026-01-05',
      );
    });
  });

  describe('addDays', () => {
    it('moves across month and year boundaries', () => {
      expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
      expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
      expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    });

    it('is not affected by DST changes', () => {
      // DST ends in Europe on 2026-10-25
      expect(addDays('2026-10-24', 1)).toBe('2026-10-25');
      expect(addDays('2026-10-25', 1)).toBe('2026-10-26');
    });
  });

  describe('getWeekStart', () => {
    it('returns Monday of the same week', () => {
      expect(getWeekStart('2026-11-16')).toBe('2026-11-16'); // Monday
      expect(getWeekStart('2026-11-18')).toBe('2026-11-16'); // Wednesday
      expect(getWeekStart('2026-11-22')).toBe('2026-11-16'); // Sunday
    });

    it('can go back to the previous month', () => {
      expect(getWeekStart('2026-11-01')).toBe('2026-10-26');
    });
  });

  describe('getMonthStart', () => {
    it('returns the first day of the month', () => {
      expect(getMonthStart('2026-11-15')).toBe('2026-11-01');
    });
  });

  describe('formatReadableDate', () => {
    it('formats a day itself, whatever the local time zone is', () => {
      expect(formatReadableDate('2026-11-15')).toBe('Nov 15, 2026');
      expect(formatReadableDate('2026-11-15', 'long')).toBe(
        'November 15, 2026',
      );
    });

    it('formats a date in the local time zone', () => {
      expect(formatReadableDate(new Date(2026, 10, 15, 23, 30))).toBe(
        'Nov 15, 2026',
      );
    });
  });

  describe('isValidTimeZone', () => {
    it('accepts IANA time zones only', () => {
      expect(isValidTimeZone('Europe/Kyiv')).toBe(true);
      expect(isValidTimeZone('UTC')).toBe(true);
      expect(isValidTimeZone('Mars/Olympus')).toBe(false);
    });
  });
});
