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

const padWithZero = (value: number) => value < 10 ? `0${value}` : `${value}`;

export function calculateTimeValues(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return [hours, minutes, seconds - hours * 3600 - minutes * 60].map(padWithZero);
}

export const getRandomValue = <T>(arr: T[]): T => {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}
