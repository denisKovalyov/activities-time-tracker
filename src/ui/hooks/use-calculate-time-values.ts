import { useMemo } from 'react';

const padWithZero = (value: number) => (value < 10 ? `0${value}` : `${value}`);
const calculateTimeValues = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return [hours, minutes, seconds - hours * 3600 - minutes * 60].map(
    padWithZero,
  );
};

export const useCalculateTimeValues = (seconds: number) =>
  useMemo(() => calculateTimeValues(seconds), [seconds]);
