// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { startTimer, stopTimer } from '@/lib/actions/timer';
import { DEFAULT_ERROR_MESSAGE } from '@/lib/actions/constants';
import type { ActionResult } from '@/lib/actions/utils/result';
import type { RunningTimer, TimeTotals } from '@/lib/types';
import {
  TimerProvider,
  useActivitySeconds,
  useRunSeconds,
  useTimer,
  useTotalSeconds,
} from '@/ui/timer/timer-provider';

const { toast, refresh } = vi.hoisted(() => ({
  toast: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock('@/lib/actions/timer', () => ({
  startTimer: vi.fn(),
  stopTimer: vi.fn(),
}));
vi.mock('@/ui/hooks/use-toast', () => ({ toast }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));

const SECOND = 1000;
// When the server rendered the data
const LOADED_AT = new Date('2026-11-15T10:00:00Z').getTime();

type Probe = {
  timer: ReturnType<typeof useTimer>;
  a: number;
  b: number;
  total: number;
  run: number;
};

// Renders the hooks the way the dashboard uses them, `probe.current` has the
// latest values
const renderTimer = (timer: RunningTimer | null, totals: TimeTotals) => {
  const probe = { current: null as unknown as Probe };
  const Probe = () => {
    probe.current = {
      timer: useTimer(),
      a: useActivitySeconds('a'),
      b: useActivitySeconds('b'),
      total: useTotalSeconds(),
      run: useRunSeconds(),
    };
    return null;
  };
  const ui = (timer: RunningTimer | null, totals: TimeTotals) => (
    <TimerProvider timer={timer} totals={totals} countedAt={Date.now()}>
      <Probe />
    </TimerProvider>
  );

  const { rerender } = render(ui(timer, totals));
  return {
    probe,
    // A re-render with fresh data from the server
    serverRender: (timer: RunningTimer | null, totals: TimeTotals) =>
      rerender(ui(timer, totals)),
  };
};

// An action that finishes when the test says so. Every test must finish it:
// React reverts optimistic updates only when all pending actions are done.
const defer = (action: typeof startTimer | typeof stopTimer) => {
  let finish!: (result: ActionResult) => void;
  let fail!: (error: Error) => void;
  vi.mocked(action).mockReturnValue(
    new Promise((resolve, reject) => {
      finish = resolve;
      fail = reject;
    }),
  );
  return {
    finish: (result: ActionResult = { ok: true, data: undefined }) =>
      act(async () => finish(result)),
    fail: (error: Error) => act(async () => fail(error)),
  };
};

const tick = (seconds: number) =>
  act(() => vi.advanceTimersByTime(seconds * SECOND));

const runningSince = (activityId: string, secondsAgo: number) => ({
  activityId,
  startedAt: new Date(Date.now() - secondsAgo * SECOND),
});

beforeEach(() => {
  vi.useFakeTimers({
    now: LOADED_AT,
    toFake: ['Date', 'setInterval', 'clearInterval'],
  });
  vi.mocked(startTimer).mockReset();
  vi.mocked(stopTimer).mockReset();
  toast.mockReset();
  refresh.mockReset();
});

afterEach(() => {
  // The clock in use-now is shared, so nothing may stay subscribed
  cleanup();
  vi.useRealTimers();
});

describe('TimerProvider', () => {
  it('counts live time of the running activity', async () => {
    // "a" has 100s today, including the 30s of the current run
    const { probe } = renderTimer(runningSince('a', 30), { a: 100, b: 50 });

    await tick(5);

    expect(probe.current).toMatchObject({ a: 105, b: 50, total: 155, run: 35 });
  });

  it('starts the timer at once, before the action finishes', async () => {
    const start = defer(startTimer);
    const { probe, serverRender } = renderTimer(null, { a: 100 });

    act(() => probe.current.timer.start('b'));
    await tick(3);

    expect(startTimer).toHaveBeenCalledWith('b');
    expect(probe.current).toMatchObject({ a: 100, b: 3, total: 103, run: 3 });
    expect(probe.current.timer.activeId).toBe('b');

    serverRender(runningSince('b', 3), { a: 100, b: 3 });
    await start.finish();
    await tick(2);

    expect(probe.current).toMatchObject({ b: 5, total: 105, run: 5 });
    expect(toast).not.toHaveBeenCalled();
  });

  it('switches to another activity and keeps the time of the stopped one', async () => {
    const start = defer(startTimer);
    const { probe } = renderTimer(runningSince('a', 0), { a: 100 });

    await tick(10);
    act(() => probe.current.timer.toggle('b'));
    await tick(5);

    expect(probe.current).toMatchObject({ a: 110, b: 5, total: 115, run: 5 });
    await start.finish();
  });

  it('stops when the running activity is toggled', async () => {
    const stop = defer(stopTimer);
    const { probe } = renderTimer(runningSince('a', 0), { a: 100 });

    await tick(10);
    act(() => probe.current.timer.toggle('a'));
    await tick(5);

    expect(stopTimer).toHaveBeenCalled();
    expect(startTimer).not.toHaveBeenCalled();
    expect(probe.current.timer.activeId).toBeNull();
    expect(probe.current).toMatchObject({ a: 110, total: 110, run: 0 });
    await stop.finish();
  });

  it('goes back to the server state and shows the error when the action fails', async () => {
    const start = defer(startTimer);
    const { probe } = renderTimer(null, { a: 100 });

    act(() => probe.current.timer.start('b'));
    await start.finish({ ok: false, message: 'Failed to start timer.' });

    expect(probe.current.timer.activeId).toBeNull();
    expect(probe.current).toMatchObject({ b: 0, total: 100 });
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Failed to start timer.' }),
    );
    expect(refresh).not.toHaveBeenCalled();
  });

  it('reloads the data when the request fails, as the change may be saved', async () => {
    const start = defer(startTimer);
    const { probe } = renderTimer(null, {});

    act(() => probe.current.timer.start('b'));
    await start.fail(new Error('Network error'));

    expect(refresh).toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: DEFAULT_ERROR_MESSAGE }),
    );
  });
});
