import type { TimeTotals } from '@/lib/types';

export type TimerState = {
  activeId: string | null;
  // When the current run started, in ms
  startedAt: number | null;
  // Seconds spent today per activity, counted up to `countedAt` (ms)
  totals: TimeTotals;
  countedAt: number;
};

export type TimerAction =
  | { type: 'start'; activityId: string; at: number }
  | { type: 'stop'; at: number };

// Seconds of the current run after `countedAt`
export const getLiveSeconds = (
  { activeId, startedAt }: Pick<TimerState, 'activeId' | 'startedAt'>,
  now: number,
  countedAt: number,
) =>
  activeId && startedAt !== null
    ? Math.max(0, Math.floor((now - Math.max(countedAt, startedAt)) / 1000))
    : 0;

export const getActivitySeconds = (
  state: TimerState,
  activityId: string,
  now: number,
) =>
  (state.totals[activityId] ?? 0) +
  (state.activeId === activityId
    ? getLiveSeconds(state, now, state.countedAt)
    : 0);

export const getTotalSeconds = (state: TimerState, now: number) =>
  Object.values(state.totals).reduce((sum, seconds) => sum + seconds, 0) +
  getLiveSeconds(state, now, state.countedAt);

// Optimistic update after a click. The current run is added to `totals`, so
// the stopped activity keeps its time until fresh data comes.
export const timerReducer = (
  state: TimerState,
  action: TimerAction,
): TimerState => {
  if (action.type === 'start' && action.activityId === state.activeId) {
    return state;
  }

  const live = getLiveSeconds(state, action.at, state.countedAt);
  const totals =
    state.activeId && live
      ? {
          ...state.totals,
          [state.activeId]: (state.totals[state.activeId] ?? 0) + live,
        }
      : state.totals;

  return action.type === 'start'
    ? {
        activeId: action.activityId,
        startedAt: action.at,
        totals,
        countedAt: action.at,
      }
    : { activeId: null, startedAt: null, totals, countedAt: action.at };
};
