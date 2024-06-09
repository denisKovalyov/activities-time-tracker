import { initNewStore } from '@/lib/temporary-store';

export const CLEAN_UP_INTERVAL = 1000 * 60 * 5;

export const emailSentCache = initNewStore(
  CLEAN_UP_INTERVAL,
  (_, timestamp) => Date.now() - +timestamp >= CLEAN_UP_INTERVAL,
);
