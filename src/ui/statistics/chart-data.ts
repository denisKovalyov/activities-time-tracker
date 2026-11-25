import type { Activity, DayTotal, TimeTotals } from '@/lib/types';
import { formatReadableDate } from '@/lib/utils/day';

export type DataItem = {
  name: string;
  value: number;
  id?: string;
  fill?: string;
  aggregate?: boolean;
};

// One bar per activity with time in the period
export const getActivitiesChartData = (
  activities: Activity[],
  totals: TimeTotals,
): DataItem[] =>
  activities
    .map(({ id, name, color }) => ({
      id,
      name,
      fill: `#${color}`,
      value: totals[id] ?? 0,
    }))
    .filter(({ value }) => value > 0);

// One bar per day, today first. The day is the id, so the chart can add
// live time to today's bar.
export const getDaysChartData = (days: DayTotal[]): DataItem[] =>
  days.toReversed().map(({ day, seconds }, i) => ({
    id: day,
    name: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : formatReadableDate(day),
    value: seconds,
  }));

export const sumValues = (items: { value: number }[]) =>
  items.reduce((sum, { value }) => sum + value, 0);
