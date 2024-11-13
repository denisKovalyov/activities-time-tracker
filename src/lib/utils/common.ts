import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ActivityExtended } from '@/lib/definitions';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function setDelay(milliseconds: number) {
  return new Promise((resolve) => {
    const timerId = setTimeout(() => {
      resolve(true);
      clearTimeout(timerId);
    }, milliseconds);
  });
}

export const getRandomValue = <T>(arr: T[]): T => {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
};

const getTotalTimeSpent = (activities: ActivityExtended[]) => activities
  .reduce((acc, { time_spent }) => acc + time_spent, 0);

export const calculateTimeDiff = (activitiesCurrent: ActivityExtended[], activitiesPrevious: ActivityExtended[]) => {
  const currentTotalTime = getTotalTimeSpent(activitiesCurrent);
  const previousTotalTime = getTotalTimeSpent(activitiesPrevious);

  if (previousTotalTime === 0) {
    return currentTotalTime > 0 ? 100 : 0;
  }

  return ((currentTotalTime - previousTotalTime) / previousTotalTime) * 100;
}

export const prepareChartData = (
  activities: ActivityExtended[],
  currentTimeSpent: number,
  activeActivity?: [string, string] | null,
) =>
  activities.map(({ id, name, color, time_spent: value }) => ({
    name,
    fill: `#${color}`,
    value: id === activeActivity?.[0] ? (value + currentTimeSpent) : value,
  }));

export const noop = () => {};
