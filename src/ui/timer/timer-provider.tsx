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
  getTotalSeconds,
  timerReducer,
} from '@/ui/timer/timer-state';

type TimerContextValue = {
  state: TimerState;
  start: (activityId: string) => void;
  stop: () => void;
};

const TimerContext = createContext<TimerContextValue | null>(null);

// `timer` and `totals` come from the server. A click updates the state
// optimistically until the action and the re-render with fresh data finish.
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
        const showError = (title: string) =>
          toast({ title, variant: 'destructive' });

        try {
          const result = await request();
          if (!result.ok) showError(result.message);
        } catch {
          // E.g. a network error: it's unknown whether the change was saved
          router.refresh();
          showError(DEFAULT_ERROR_MESSAGE);
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

// Doesn't re-render every second, unlike the hooks with live time below
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

// Seconds spent on the activity today
export const useActivitySeconds = (activityId: string) => {
  const { state } = useTimerContext();
  const now = useNow(state.activeId === activityId);
  return getActivitySeconds(state, activityId, now);
};

// Seconds spent on all activities today
export const useTotalSeconds = () => {
  const { state } = useTimerContext();
  const now = useNow(state.activeId !== null);
  return getTotalSeconds(state, now);
};

// Length of the current run in seconds.
export const useRunSeconds = () => {
  const { state } = useTimerContext();
  // No clock (0) on the server and during hydration
  const now = useNow(state.activeId !== null) || state.countedAt;
  return state.startedAt === null
    ? 0
    : Math.max(0, Math.floor((now - state.startedAt) / 1000));
};
