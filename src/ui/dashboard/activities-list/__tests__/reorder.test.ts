import { describe, expect, it } from 'vitest';

import type { Move } from '@/lib/types';

import { getMoves, mergeVisibleOrder } from '../reorder';

// Applies moves the same way the server does: put the item right after
// `previousId`, or at the top
const applyMoves = (list: string[], moves: Move[]) =>
  moves.reduce((result, { id, previousId }) => {
    const withoutItem = result.filter((item) => item !== id);
    const index = previousId === null ? 0 : withoutItem.indexOf(previousId) + 1;
    return [...withoutItem.slice(0, index), id, ...withoutItem.slice(index)];
  }, list);

describe('getMoves', () => {
  it('returns nothing when the order is the same', () => {
    expect(getMoves(['a', 'b', 'c'], ['a', 'b', 'c'])).toEqual([]);
  });

  it('moves only the dragged item', () => {
    expect(getMoves(['a', 'b', 'c', 'd'], ['d', 'a', 'b', 'c'])).toEqual([
      { id: 'd', previousId: null },
    ]);
    expect(getMoves(['a', 'b', 'c', 'd'], ['b', 'c', 'a', 'd'])).toEqual([
      { id: 'a', previousId: 'c' },
    ]);
  });

  it.each([
    [['b', 'd', 'a', 'c']],
    [['d', 'c', 'b', 'a']],
    [['c', 'a', 'd', 'b']],
  ])('produces moves that give %j', (reordered) => {
    const original = ['a', 'b', 'c', 'd'];
    expect(applyMoves(original, getMoves(original, reordered))).toEqual(
      reordered,
    );
  });
});

describe('mergeVisibleOrder', () => {
  const items = (ids: string) => ids.split('').map((id) => ({ id }));
  const ids = (list: { id: string }[]) => list.map(({ id }) => id).join('');

  it('keeps hidden items in their places', () => {
    // "b" and "d" are hidden, "e" was dragged above "a"
    expect(ids(mergeVisibleOrder(items('abcde'), items('eac')))).toBe('ebadc');
  });

  it('returns the reordered list when nothing is hidden', () => {
    expect(ids(mergeVisibleOrder(items('abc'), items('cab')))).toBe('cab');
  });
});
