import { useMemo } from 'react';
import { calculateTimeValues } from '@/lib/utils';

export const useCalculateTimeValues = (seconds: number) => useMemo(() => calculateTimeValues(seconds), [seconds]);
