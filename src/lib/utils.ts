import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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

export const getSecondsPassed = (dateStr: string | null | undefined) =>
  dateStr ? Math.floor((+new Date() - +new Date(dateStr)) / 1000) : 0;

export const formatDate = (date: Date) =>
  new Date(`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`)
    .toISOString()
    .split('T')[0];

export const noop = () => {};
