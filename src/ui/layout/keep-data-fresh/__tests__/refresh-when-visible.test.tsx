// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RefreshWhenVisible } from '@/ui/layout/keep-data-fresh/refresh-when-visible';

const refresh = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));

const SECOND = 1000;
const MINUTE = 60 * SECOND;

let visibilityState: DocumentVisibilityState;

const setVisibility = (state: DocumentVisibilityState) => {
  visibilityState = state;
  document.dispatchEvent(new Event('visibilitychange'));
};
const fire = (event: 'focus' | 'online') =>
  window.dispatchEvent(new Event(event));

const tick = (ms: number) => act(() => vi.advanceTimersByTime(ms));

beforeEach(() => {
  vi.useFakeTimers({ now: new Date('2026-11-15T10:00:00Z') });
  vi.spyOn(document, 'visibilityState', 'get').mockImplementation(
    () => visibilityState,
  );
  visibilityState = 'visible';
  refresh.mockReset();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('RefreshWhenVisible', () => {
  it('refreshes when the tab is shown, not when it is hidden', () => {
    render(<RefreshWhenVisible />);

    setVisibility('hidden');
    expect(refresh).not.toHaveBeenCalled();

    setVisibility('visible');
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('refreshes once when the tab is shown and focused together', async () => {
    render(<RefreshWhenVisible />);

    setVisibility('visible');
    fire('focus');
    expect(refresh).toHaveBeenCalledTimes(1);

    await tick(2 * SECOND);
    fire('focus');
    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it('always refreshes when the connection comes back', () => {
    render(<RefreshWhenVisible />);

    // The refresh on focus may have failed while offline
    fire('focus');
    fire('online');

    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it('refreshes every minute only while the tab is visible', async () => {
    render(<RefreshWhenVisible />);

    await tick(MINUTE);
    expect(refresh).toHaveBeenCalledTimes(1);

    visibilityState = 'hidden';
    await tick(5 * MINUTE);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('stops refreshing when unmounted', async () => {
    const { unmount } = render(<RefreshWhenVisible />);

    unmount();
    setVisibility('visible');
    fire('focus');
    fire('online');
    await tick(MINUTE);

    expect(refresh).not.toHaveBeenCalled();
  });
});
