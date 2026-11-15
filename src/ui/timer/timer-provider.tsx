'use client';

import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useOptimistic,
  useTransition,
} from 'react';
import { useRouter } from 'next/navigation';

import { startTimer, stopTimer } from '@/lib/actions/timer';
import type { ActionResult } from '@/lib/actions/utils/result';
import { DEFAULT_ERROR_MESSAGE } from '@/lib/actions/constants';
import type { RunningTimer, TimeTotals } from '@/lib/db/types';
import { useToast } from '@/ui/hooks/use-toast';
import { useNow } from '@/ui/timer/use-now';
import {
  type TimerAction,
  type TimerState,
  getActivitySeconds,
  getLiveSeconds,
  getTotalSeconds,
  timerReducer,
} from '@/ui/timer/timer-state';

type TimerContextValue = {
  state: TimerState;
  start: (activityId: string) => void;
  stop: () => void;
};

const TimerContext = createContext<TimerContextValue | null>(null);

// The server is the source of truth: `timer` and `totals` come from the
// database on every render of the layout. A click updates the state
// optimistically right away; once the server action and the re-render with
// fresh data finish, React drops the optimistic state.
export const TimerProvider = ({
  timer,
  totals,
  countedAt,
  children,
}: {
  timer: RunningTimer | null;
  totals: TimeTotals;
  countedAt: number;
  children: ReactNode;
}) => {
  const serverState = useMemo<TimerState>(
    () => ({
      activeId: timer?.activityId ?? null,
      startedAt: timer?.startedAt.getTime() ?? null,
      totals,
      countedAt,
    }),
    [timer, totals, countedAt],
  );
  const [state, updateOptimistically] = useOptimistic(
    serverState,
    timerReducer,
  );
  const [, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const run = useCallback(
    (action: TimerAction, request: () => Promise<ActionResult>) => {
      startTransition(async () => {
        updateOptimistically(action);
        // The optimistic state is dropped when the transition ends, so on an
        // error the UI goes back to what the server has; only a toast is
        // needed. A request can also reject (e.g. network error or 502), which
        // must not reach the error boundary. Then it's unknown whether the
        // change was saved, so the data is loaded again.
        const result = await request().catch(() => null);
        if (!result) router.refresh();
        if (!result?.ok) {
          toast({
            title: result?.message ?? DEFAULT_ERROR_MESSAGE,
            variant: 'destructive',
          });
        }
      });
    },
    [updateOptimistically, toast, router],
  );

  const start = useCallback(
    (activityId: string) =>
      run({ type: 'start', activityId, at: Date.now() }, () =>
        startTimer(activityId),
      ),
    [run],
  );

  const stop = useCallback(
    () => run({ type: 'stop', at: Date.now() }, stopTimer),
    [run],
  );

  const value = useMemo(() => ({ state, start, stop }), [state, start, stop]);

  return (
    <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
  );
};

const useTimerContext = () => {
  const context = useContext(TimerContext);
  if (!context) throw new Error('Timer hooks must be used in TimerProvider');
  return context;
};

// Timer controls. Components using only this hook don't re-render every
// second.
export const useTimer = () => {
  const { state, start, stop } = useTimerContext();
  const { activeId } = state;

  const toggle = useCallback(
    (activityId: string) =>
      activityId === activeId ? stop() : start(activityId),
    [activeId, start, stop],
  );

  return { activeId, start, stop, toggle };
};

// Seconds spent on the activity today, live while it's running.
export const useActivitySeconds = (activityId: string) => {
  const { state } = useTimerContext();
  const now = useNow(state.activeId === activityId);
  return getActivitySeconds(state, activityId, now);
};

// Seconds spent on all activities today, live while a timer is running.
export const useTotalSeconds = () => {
  const { state } = useTimerContext();
  const now = useNow(state.activeId !== null);
  return getTotalSeconds(state, now);
};

// Length of the current run in seconds.
export const useRunSeconds = () => {
  const { state } = useTimerContext();
  // On the server and during hydration there is no clock yet (0), so the
  // run is shown as long as it was when the data was loaded.
  const now = useNow(state.activeId !== null) || state.countedAt;
  return state.startedAt === null
    ? 0
    : Math.max(0, Math.floor((now - state.startedAt) / 1000));
};

// Seconds of the current run that data loaded at `countedAt` doesn't include
// yet. For pages with their own data, e.g. statistics.
export const useLiveSeconds = (countedAt: number) => {
  const { state } = useTimerContext();
  const now = useNow(state.activeId !== null);
  return getLiveSeconds(state, now, countedAt);
};
