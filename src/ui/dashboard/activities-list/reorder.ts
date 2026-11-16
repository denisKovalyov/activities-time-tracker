import type { Move } from '@/lib/db/types';

// Indexes of the items that kept their relative order. O(n²) is fine for a
// list of activities.
const getLongestIncreasingSubsequence = (values: number[]) => {
  const lengths = values.map(() => 1);
  const previous = values.map(() => -1);

  values.forEach((value, i) => {
    for (let j = 0; j < i; j++) {
      if (values[j] < value && lengths[j] + 1 > lengths[i]) {
        lengths[i] = lengths[j] + 1;
        previous[i] = j;
      }
    }
  });

  const result = new Set<number>();
  let i = lengths.indexOf(Math.max(...lengths));
  while (i !== -1) {
    result.add(i);
    i = previous[i];
  }
  return result;
};

// The fewest moves that turn `original` into `reordered`, to be applied in
// the returned order.
export const getMoves = (original: string[], reordered: string[]): Move[] => {
  const originalIndex = new Map(original.map((id, i) => [id, i]));
  const staying = getLongestIncreasingSubsequence(
    reordered.map((id) => originalIndex.get(id) ?? -1),
  );

  return reordered
    .map((id, i) => ({ id, previousId: reordered[i - 1] ?? null }))
    .filter((_, i) => !staying.has(i));
};

// Reorder.Group reports only rendered items, so while a search hides some
// activities, the hidden ones keep their places.
export const mergeVisibleOrder = <T extends { id: string }>(
  list: T[],
  visibleReordered: T[],
): T[] => {
  const visibleIds = new Set(visibleReordered.map(({ id }) => id));
  const queue = [...visibleReordered];
  return list.map((item) => (visibleIds.has(item.id) ? queue.shift()! : item));
};
