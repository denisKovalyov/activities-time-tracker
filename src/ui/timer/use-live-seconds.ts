import type { RunningTimer } from '@/lib/types';
import { getLiveSeconds } from '@/ui/timer/timer-state';
import { useNow } from '@/ui/timer/use-now';

// For pages that load the timer with their own data instead of using
// TimerProvider
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
