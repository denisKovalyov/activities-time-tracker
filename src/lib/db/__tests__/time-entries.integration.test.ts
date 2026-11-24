import { beforeEach, describe, expect, it } from 'vitest';

import { dbCreateActivity } from '@/lib/db/activities';
import {
  dbReadTimerAndStatistics,
  dbReadTimerAndTotals,
  dbStartTimer,
  dbStopTimer,
} from '@/lib/db/time-entries';
import type { DayRange } from '@/lib/db/types';
import { clearDatabase, createUser, query } from '@/test/integration/helpers';

let userId: string;
let otherUserId: string;

const at = (iso: string) => new Date(iso);

const create = (name: string, user = userId) =>
  dbCreateActivity(user, { name, color: 'ffffff', icon: 'circle' });

// Entries at fixed times for the totals tests. A null end means it's running.
const addEntry = (
  activityId: string,
  startedAt: string,
  endedAt: string | null = null,
  user = userId,
) =>
  query(
    `INSERT INTO time_entry(user_id, activity_id, started_at, ended_at)
    VALUES ($1, $2, $3, $4)`,
    [user, activityId, startedAt, endedAt],
  );

const getEntries = () =>
  query<{ activity_id: string; started_at: Date; ended_at: Date | null }>(
    'SELECT activity_id, started_at, ended_at FROM time_entry ORDER BY started_at',
  );

// The app reads time only through these two snapshot reads
const getRunningTimer = async (user: string) =>
  (await dbReadTimerAndTotals(user, range({}))).timer;
const getTotalsByActivity = async (user: string, days: DayRange) =>
  (await dbReadTimerAndTotals(user, days)).totals;
const getTotalsByDay = async (user: string, days: DayRange) =>
  (
    await dbReadTimerAndStatistics(user, {
      days,
      today: days,
      week: days,
      month: days,
    })
  ).days;

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

describe('dbStartTimer / dbStopTimer', () => {
  it('starts, switches and stops the timer', async () => {
    const a = await create('A');
    const b = await create('B');

    await dbStartTimer(userId, a.id);
    await dbStartTimer(userId, b.id);
    expect((await getRunningTimer(userId))?.activityId).toBe(b.id);

    const stopped = await dbStopTimer(userId);

    expect(stopped?.activityId).toBe(b.id);
    expect(await getRunningTimer(userId)).toBeNull();
    const [first, second] = await getEntries();
    expect(first.activity_id).toBe(a.id);
    expect(second.activity_id).toBe(b.id);
    // B starts exactly when A ends
    expect(second.started_at).toEqual(first.ended_at);
    expect(second.ended_at! >= second.started_at).toBe(true);
  });

  it('keeps the timer when the running activity is started again', async () => {
    const a = await create('A');

    const started = await dbStartTimer(userId, a.id);
    const timer = await dbStartTimer(userId, a.id);

    expect(timer.startedAt).toEqual(started.startedAt);
    expect(await getEntries()).toHaveLength(1);
  });

  it('returns null when stopping without a running timer', async () => {
    expect(await dbStopTimer(userId)).toBeNull();
  });

  it('leaves exactly one running timer after simultaneous starts', async () => {
    const activities = await Promise.all(
      ['A', 'B', 'C', 'D', 'E'].map((name) => create(name)),
    );

    await Promise.all(activities.map(({ id }) => dbStartTimer(userId, id)));

    expect(
      await query('SELECT * FROM time_entry WHERE ended_at IS NULL'),
    ).toHaveLength(1);
    expect(await query('SELECT * FROM time_entry')).toHaveLength(5);
  });

  it("doesn't start before the latest entry when the clock is behind", async () => {
    const a = await create('A');
    const b = await create('B');
    const future = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    await addEntry(a.id, future);

    await dbStartTimer(userId, b.id);

    // Both entries start at `future`, so they're found by activity, not order
    const entries = await getEntries();
    const entryOf = (id: string) => entries.find((e) => e.activity_id === id);
    expect(entries).toHaveLength(2);
    expect(entryOf(a.id)?.ended_at).toEqual(at(future));
    expect(entryOf(b.id)?.started_at).toEqual(at(future));
  });

  it('rejects an activity of another user', async () => {
    const other = await create('X', otherUserId);

    await expect(dbStartTimer(userId, other.id)).rejects.toThrow();
    expect(await getRunningTimer(userId)).toBeNull();
  });
});

describe('getTotalsByActivity', () => {
  it('splits an entry at midnight in the user time zone', async () => {
    const a = await create('A');
    // Kyiv is UTC+2 in November: 23:00 - 01:30 local time
    await addEntry(a.id, '2026-11-14T21:00:00Z', '2026-11-14T23:30:00Z');
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
    await addEntry(a.id, '2026-11-14T23:00:00Z');

    expect(
      await getTotalsByActivity(
        userId,
        range({ now: at('2026-11-15T01:00:00Z') }),
      ),
    ).toEqual({ [a.id]: 3600 });
  });

  it("doesn't count entries of other users", async () => {
    const other = await create('X', otherUserId);
    await addEntry(other.id, '2026-11-15T10:00:00Z', null, otherUserId);

    expect(await getTotalsByActivity(userId, range({}))).toEqual({});
  });
});

describe('getTotalsByDay', () => {
  it('returns every day of the range, including days without time', async () => {
    const a = await create('A');
    await addEntry(a.id, '2026-11-14T23:00:00Z');

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
    await addEntry(a.id, '2026-10-24T20:00:00Z', '2026-10-25T23:00:00Z');

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
    await addEntry(other.id, '2026-11-15T10:00:00Z', null, otherUserId);

    const [day] = await getTotalsByDay(userId, range({}));

    expect(day.seconds).toBe(0);
  });
});

describe('dbReadTimerAndTotals', () => {
  it('reads the running timer and totals together', async () => {
    const a = await create('A');
    await addEntry(a.id, '2026-11-15T10:00:00Z');

    const { timer, totals } = await dbReadTimerAndTotals(
      userId,
      range({ now: at('2026-11-15T10:30:00Z') }),
    );

    expect(timer).toEqual({
      activityId: a.id,
      startedAt: at('2026-11-15T10:00:00Z'),
    });
    expect(totals).toEqual({ [a.id]: 1800 });
  });
});

describe('dbReadTimerAndStatistics', () => {
  it('reads the running timer, days and each range together', async () => {
    const a = await create('A');
    const b = await create('B');
    await addEntry(b.id, '2026-11-03T10:00:00Z', '2026-11-03T11:00:00Z');
    await addEntry(a.id, '2026-11-10T10:00:00Z', '2026-11-10T11:00:00Z');
    await addEntry(a.id, '2026-11-15T10:00:00Z');

    const now = at('2026-11-15T10:30:00Z');
    const since = (from: string) => range({ from, now });

    const statistics = await dbReadTimerAndStatistics(userId, {
      days: since('2026-11-14'),
      today: since('2026-11-15'),
      week: since('2026-11-09'),
      month: since('2026-11-01'),
    });

    expect(statistics).toEqual({
      timer: { activityId: a.id, startedAt: at('2026-11-15T10:00:00Z') },
      days: [
        { day: '2026-11-14', seconds: 0 },
        { day: '2026-11-15', seconds: 1800 },
      ],
      todayTotals: { [a.id]: 1800 },
      weekTotals: { [a.id]: 5400 },
      monthTotals: { [a.id]: 5400, [b.id]: 3600 },
    });
  });
});
