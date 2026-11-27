// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { reorderActivities } from '@/lib/actions/activities';
import type { ActionResult } from '@/lib/actions/utils/result';
import type { Activity } from '@/lib/types';
import { useActivitiesOrder } from '../use-activities-order';

const toast = vi.hoisted(() => vi.fn());

vi.mock('@/lib/actions/activities', () => ({ reorderActivities: vi.fn() }));
vi.mock('@/ui/hooks/use-toast', () => ({ toast }));

const activity = (id: string) => ({ id, name: id }) as Activity;
const list = (ids: string) => ids.split('').map(activity);
const ids = (activities: Activity[]) => activities.map(({ id }) => id).join('');

// A save that finishes when the test says so
const deferSave = () => {
  let finish!: (result: ActionResult) => void;
  let fail!: (error: Error) => void;
  vi.mocked(reorderActivities).mockReturnValue(
    new Promise((resolve, reject) => {
      finish = resolve;
      fail = reject;
    }),
  );
  return {
    finish: (result: ActionResult) => act(async () => finish(result)),
    fail: (error: Error) => act(async () => fail(error)),
  };
};

const render = (activities = list('abc')) =>
  renderHook(({ activities }) => useActivitiesOrder(activities), {
    initialProps: { activities },
  });

const dragAndDrop = (
  result: ReturnType<typeof render>['result'],
  reordered: string,
) => {
  act(() => result.current.handleReorder(list(reordered)));
  act(() => result.current.handleDrop());
};

beforeEach(() => {
  vi.mocked(reorderActivities).mockReset();
  toast.mockReset();
});

afterEach(cleanup);

describe('useActivitiesOrder', () => {
  it('shows the new order while it is being saved', async () => {
    const save = deferSave();
    const { result, rerender } = render();

    dragAndDrop(result, 'cab');

    expect(ids(result.current.activitiesList)).toBe('cab');
    expect(result.current.isSaving).toBe(true);
    expect(reorderActivities).toHaveBeenCalledWith([
      { id: 'c', previousId: null },
    ]);

    // The order the server rendered after the save
    rerender({ activities: list('cab') });
    await save.finish({ ok: true, data: undefined });

    expect(ids(result.current.activitiesList)).toBe('cab');
    expect(result.current.isSaving).toBe(false);
    expect(toast).not.toHaveBeenCalled();
  });

  it('keeps the new order when old data comes during the save', async () => {
    const save = deferSave();
    const { result, rerender } = render();

    dragAndDrop(result, 'cab');
    // E.g. a refresh when the tab got focus, rendered before the save
    rerender({ activities: list('abc') });

    expect(ids(result.current.activitiesList)).toBe('cab');
    await save.finish({ ok: true, data: undefined });
  });

  it('shows the error and the order from the server when saving fails', async () => {
    const save = deferSave();
    const { result } = render();

    dragAndDrop(result, 'cab');
    await save.finish({ ok: false, message: 'Activity not found.' });

    expect(ids(result.current.activitiesList)).toBe('abc');
    expect(result.current.isSaving).toBe(false);
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Activity not found.' }),
    );
  });

  it('shows an error when the request fails', async () => {
    const save = deferSave();
    const { result } = render();

    dragAndDrop(result, 'cab');
    await save.fail(new Error('Network error'));

    expect(ids(result.current.activitiesList)).toBe('abc');
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Activities order wasn't saved." }),
    );
  });

  it("doesn't save when the item was dropped in its place", async () => {
    const { result } = render();

    // Dragged down and back
    act(() => result.current.handleReorder(list('bac')));
    dragAndDrop(result, 'abc');
    await act(async () => {});

    expect(ids(result.current.activitiesList)).toBe('abc');
    expect(reorderActivities).not.toHaveBeenCalled();
    expect(result.current.isSaving).toBe(false);
  });
});
