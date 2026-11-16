// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { toDay } from '@/lib/utils/day';
import { getBrowserTimeZone } from '@/lib/utils/time-zone-cookie';
import { RefreshOnNewDay } from '@/ui/layout/keep-data-fresh/refresh-on-new-day';

const refresh = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));

const SECOND = 1000;
const HOUR = 3600 * SECOND;

// Local time of the test run, the same as in a browser
const timeZone = getBrowserTimeZone();
const today = () => toDay(new Date(), timeZone);

const tick = (ms: number) => act(() => vi.advanceTimersByTime(ms));

beforeEach(() => {
  vi.useFakeTimers({ now: new Date(2026, 10, 15, 23, 59, 50) });
  refresh.mockReset();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('RefreshOnNewDay', () => {
  it("doesn't refresh data rendered for today", () => {
    render(<RefreshOnNewDay day={today()} timeZone={timeZone} />);

    expect(refresh).not.toHaveBeenCalled();
  });

  it('refreshes on load when the data is for another day', () => {
    render(<RefreshOnNewDay day="2026-11-14" timeZone={timeZone} />);

    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('refreshes on load when the data is for another time zone', () => {
    // E.g. the cookie was missing, or the user has travelled
    const otherTimeZone =
      timeZone === 'Pacific/Kiritimati' ? 'UTC' : 'Pacific/Kiritimati';

    render(<RefreshOnNewDay day={today()} timeZone={otherTimeZone} />);

    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('refreshes at midnight, once a day', async () => {
    const { rerender } = render(
      <RefreshOnNewDay day={today()} timeZone={timeZone} />,
    );

    await tick(9 * SECOND);
    expect(refresh).not.toHaveBeenCalled();

    await tick(1 * SECOND);
    expect(refresh).toHaveBeenCalledTimes(1);

    // The server rendered the new day
    rerender(<RefreshOnNewDay day={today()} timeZone={timeZone} />);
    await tick(23 * HOUR);
    expect(refresh).toHaveBeenCalledTimes(1);

    await tick(1 * HOUR);
    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it('tries again the next midnight when the data was not refreshed', async () => {
    // E.g. the tab was offline
    render(<RefreshOnNewDay day={today()} timeZone={timeZone} />);

    await tick(10 * SECOND);
    await tick(24 * HOUR);

    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it('stops checking when unmounted', async () => {
    const { unmount } = render(
      <RefreshOnNewDay day={today()} timeZone={timeZone} />,
    );

    unmount();
    await tick(HOUR);

    expect(refresh).not.toHaveBeenCalled();
  });
});
