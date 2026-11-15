import { describe, expect, it } from 'vitest';

import {
  getActivitySeconds,
  getLiveSeconds,
  getTotalSeconds,
  timerReducer,
  type TimerState,
} from '../timer-state';

const SECOND = 1000;

// Data loaded at 100s, timer "a" running since 40s, totals counted up to 100s
const running: TimerState = {
  activeId: 'a',
  startedAt: 40 * SECOND,
  totals: { a: 300, b: 50 },
  countedAt: 100 * SECOND,
};

const stopped: TimerState = {
  activeId: null,
  startedAt: null,
  totals: { a: 300, b: 50 },
  countedAt: 100 * SECOND,
};

describe('getLiveSeconds', () => {
  it('counts from countedAt when the run started earlier', () => {
    expect(getLiveSeconds(running, 130 * SECOND, running.countedAt)).toBe(30);
  });

  it('counts from the start of the run when it started later', () => {
    const state = { ...running, startedAt: 120 * SECOND };
    expect(getLiveSeconds(state, 130 * SECOND, state.countedAt)).toBe(10);
  });

  it('is 0 without a running timer and never negative', () => {
    expect(getLiveSeconds(stopped, 130 * SECOND, stopped.countedAt)).toBe(0);
    expect(getLiveSeconds(running, 0, running.countedAt)).toBe(0);
  });
});

describe('getActivitySeconds / getTotalSeconds', () => {
  it('adds live time only to the running activity', () => {
    expect(getActivitySeconds(running, 'a', 130 * SECOND)).toBe(330);
    expect(getActivitySeconds(running, 'b', 130 * SECOND)).toBe(50);
    expect(getActivitySeconds(running, 'c', 130 * SECOND)).toBe(0);
    expect(getTotalSeconds(running, 130 * SECOND)).toBe(380);
  });
});

describe('timerReducer', () => {
  it('keeps the time of the stopped activity', () => {
    const state = timerReducer(running, { type: 'stop', at: 130 * SECOND });

    expect(state.activeId).toBeNull();
    expect(getActivitySeconds(state, 'a', 500 * SECOND)).toBe(330);
  });

  it('switches to another activity', () => {
    const state = timerReducer(running, {
      type: 'start',
      activityId: 'b',
      at: 130 * SECOND,
    });

    expect(getActivitySeconds(state, 'a', 140 * SECOND)).toBe(330);
    expect(getActivitySeconds(state, 'b', 140 * SECOND)).toBe(60);
  });

  it('ignores starting the running activity again', () => {
    expect(
      timerReducer(running, { type: 'start', activityId: 'a', at: 0 }),
    ).toBe(running);
  });
});
