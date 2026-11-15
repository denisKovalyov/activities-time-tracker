import type { RunningTimer } from '@/lib/db/types';
import { getLiveSeconds } from '@/ui/timer/timer-state';
import { useNow } from '@/ui/timer/use-now';

// Seconds of the running `timer` that data loaded at `countedAt` doesn't
// include yet. For pages that read the timer together with their own data
// (statistics) instead of using TimerProvider.
export const useLiveSeconds = (
  timer: RunningTimer | null,
  countedAt: number,
) => {
  const now = useNow(timer !== null);
  return getLiveSeconds(
    {
      activeId: timer?.activityId ?? null,
      startedAt: timer?.startedAt.getTime() ?? null,
    },
    now,
    countedAt,
  );
};
