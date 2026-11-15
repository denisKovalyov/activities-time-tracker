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

export const getCookies = () =>
  document.cookie.split('; ').reduce(
    (prev, current) => {
      const [name, ...rest] = current.split('=');
      prev[name] = rest.join('=');
      return prev;
    },
    {} as Record<string, string>,
  );

export const noop = () => {};
