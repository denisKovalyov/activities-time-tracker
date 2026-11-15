import { beforeEach, describe, expect, it } from 'vitest';

import { createActivity } from '@/lib/db/activities';
import {
  getRunningTimer,
  getTotalsByActivity,
  getTotalsByDay,
  startTimer,
  stopTimer,
} from '@/lib/db/time-entries';
import type { DayRange } from '@/lib/db/types';
import { clearDatabase, createUser, query } from '@/test/integration/helpers';

let userId: string;
let otherUserId: string;

const at = (iso: string) => new Date(iso);

const create = (name: string, user = userId) =>
  createActivity(user, { name, color: 'ffffff', icon: 'circle' });

const range = (overrides: Partial<DayRange>): DayRange => ({
  from: '2026-11-15',
  to: '2026-11-15',
  timeZone: 'UTC',
  now: at('2026-11-20T00:00:00Z'),
  ...overrides,
});

beforeEach(async () => {
  await clearDatabase();
  userId = await createUser('user@test.com');
  otherUserId = await createUser('other@test.com');
});

describe('startTimer / stopTimer', () => {
  it('starts, switches and stops the timer', async () => {
    const a = await create('A');
    const b = await create('B');

    await startTimer(userId, a.id, at('2026-11-15T10:00:00Z'));
    await startTimer(userId, b.id, at('2026-11-15T10:10:00Z'));
    expect((await getRunningTimer(userId))?.activityId).toBe(b.id);

    const stopped = await stopTimer(userId, at('2026-11-15T10:30:00Z'));

    expect(stopped?.activityId).toBe(b.id);
    expect(await getRunningTimer(userId)).toBeNull();
    expect(await getTotalsByActivity(userId, range({}))).toEqual({
      [a.id]: 600,
      [b.id]: 1200,
    });
  });

  it('keeps the timer when the running activity is started again', async () => {
    const a = await create('A');

    await startTimer(userId, a.id, at('2026-11-15T10:00:00Z'));
    const timer = await startTimer(userId, a.id, at('2026-11-15T10:05:00Z'));

    expect(timer.startedAt).toEqual(at('2026-11-15T10:00:00Z'));
    expect(await query('SELECT * FROM time_entry')).toHaveLength(1);
  });

  it('returns null when stopping without a running timer', async () => {
    expect(await stopTimer(userId)).toBeNull();
  });

  it('leaves exactly one running timer after simultaneous starts', async () => {
    const activities = await Promise.all(
      ['A', 'B', 'C', 'D', 'E'].map((name) => create(name)),
    );

    await Promise.all(activities.map(({ id }) => startTimer(userId, id)));

    expect(
      await query('SELECT * FROM time_entry WHERE ended_at IS NULL'),
    ).toHaveLength(1);
    expect(await query('SELECT * FROM time_entry')).toHaveLength(5);
  });

  it("doesn't create overlapping entries when a request comes late", async () => {
    const a = await create('A');
    const b = await create('B');
    const c = await create('C');

    await startTimer(userId, a.id, at('2026-11-15T09:00:00Z'));
    await startTimer(userId, c.id, at('2026-11-15T10:00:01Z'));
    // Captured its time before the previous request, but handled after it
    await startTimer(userId, b.id, at('2026-11-15T10:00:00Z'));

    const entries = await query<{ started_at: Date; ended_at: Date | null }>(
      'SELECT started_at, ended_at FROM time_entry ORDER BY started_at',
    );
    entries.slice(1).forEach((entry, i) => {
      expect(entry.started_at >= entries[i].ended_at!).toBe(true);
    });
    expect((await getRunningTimer(userId))?.activityId).toBe(b.id);
  });

  it('rejects an activity of another user', async () => {
    const other = await create('X', otherUserId);

    await expect(startTimer(userId, other.id)).rejects.toThrow();
    expect(await getRunningTimer(userId)).toBeNull();
  });
});

describe('getTotalsByActivity', () => {
  it('splits an entry at midnight in the user time zone', async () => {
    const a = await create('A');
    // Kyiv is UTC+2 in November: 23:00 - 01:30 local time
    await startTimer(userId, a.id, at('2026-11-14T21:00:00Z'));
    await stopTimer(userId, at('2026-11-14T23:30:00Z'));
    const kyiv = (from: string, to = from) =>
      range({ from, to, timeZone: 'Europe/Kyiv' });

    expect(await getTotalsByActivity(userId, kyiv('2026-11-14'))).toEqual({
      [a.id]: 3600,
    });
    expect(await getTotalsByActivity(userId, kyiv('2026-11-15'))).toEqual({
      [a.id]: 5400,
    });
    expect(
      await getTotalsByActivity(userId, kyiv('2026-11-14', '2026-11-15')),
    ).toEqual({ [a.id]: 9000 });
    // In UTC the whole entry is on the 14th
    expect(
      await getTotalsByActivity(
        userId,
        range({ from: '2026-11-14', to: '2026-11-14' }),
      ),
    ).toEqual({ [a.id]: 9000 });
  });

  it('counts a running timer up to now, also when started yesterday', async () => {
    const a = await create('A');
    await startTimer(userId, a.id, at('2026-11-14T23:00:00Z'));

    expect(
      await getTotalsByActivity(
        userId,
        range({ now: at('2026-11-15T01:00:00Z') }),
      ),
    ).toEqual({ [a.id]: 3600 });
  });

  it("doesn't count entries of other users", async () => {
    const other = await create('X', otherUserId);
    await startTimer(otherUserId, other.id, at('2026-11-15T10:00:00Z'));

    expect(await getTotalsByActivity(userId, range({}))).toEqual({});
  });
});

describe('getTotalsByDay', () => {
  it('returns every day of the range, including days without time', async () => {
    const a = await create('A');
    await startTimer(userId, a.id, at('2026-11-14T23:00:00Z'));

    const days = await getTotalsByDay(
      userId,
      range({
        from: '2026-11-13',
        to: '2026-11-16',
        now: at('2026-11-15T01:00:00Z'),
      }),
    );

    expect(days).toEqual([
      { day: '2026-11-13', seconds: 0 },
      { day: '2026-11-14', seconds: 3600 },
      { day: '2026-11-15', seconds: 3600 },
      { day: '2026-11-16', seconds: 0 },
    ]);
  });

  it('handles the 25-hour day when DST ends', async () => {
    const a = await create('A');
    // Kyiv, 2026-10-25: from 2026-10-24T21:00Z to 2026-10-25T22:00Z
    await startTimer(userId, a.id, at('2026-10-24T20:00:00Z'));
    await stopTimer(userId, at('2026-10-25T23:00:00Z'));

    const days = await getTotalsByDay(
      userId,
      range({ from: '2026-10-24', to: '2026-10-26', timeZone: 'Europe/Kyiv' }),
    );

    expect(days).toEqual([
      { day: '2026-10-24', seconds: 3600 },
      { day: '2026-10-25', seconds: 25 * 3600 },
      { day: '2026-10-26', seconds: 3600 },
    ]);
  });

  it("doesn't count entries of other users", async () => {
    const other = await create('X', otherUserId);
    await startTimer(otherUserId, other.id, at('2026-11-15T10:00:00Z'));

    const [day] = await getTotalsByDay(userId, range({}));

    expect(day.seconds).toBe(0);
  });
});
