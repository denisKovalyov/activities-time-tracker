import 'server-only';
import type { VercelPoolClient } from '@vercel/postgres';

import { withSnapshot, withUserLock } from '@/lib/db/transaction';
import type {
  DayRange,
  DayTotal,
  RunningTimer,
  TimeTotals,
} from '@/lib/db/types';

type RunningTimerRow = { activity_id: string; started_at: Date };

const toRunningTimer = (row?: RunningTimerRow): RunningTimer | null =>
  row ? { activityId: row.activity_id, startedAt: row.started_at } : null;

// The moment of a timer switch: the running entry ends and the next one starts
// at it. It's the current time, but never before the user's latest entry, so
// entries can't overlap even if the clock goes back. Tests pass a fixed `now`.
async function getSwitchTime(
  client: VercelPoolClient,
  userId: string,
  now?: Date,
): Promise<Date> {
  const result = await client.query<{ at: Date }>(
    `SELECT GREATEST(
      COALESCE($2::timestamptz, clock_timestamp()),
      (SELECT COALESCE(ended_at, started_at) FROM time_entry
        WHERE user_id=$1 ORDER BY started_at DESC LIMIT 1)
    ) AS at`,
    [userId, now ?? null],
  );
  return result.rows[0].at;
}

const STOP_RUNNING_SQL = `
  UPDATE time_entry SET ended_at=$2
  WHERE user_id=$1 AND ended_at IS NULL
  RETURNING activity_id, started_at`;

const queryRunningTimer = async (client: VercelPoolClient, userId: string) => {
  const result = await client.query<RunningTimerRow>(
    `SELECT activity_id, started_at FROM time_entry
    WHERE user_id=$1 AND ended_at IS NULL`,
    [userId],
  );
  return toRunningTimer(result.rows[0]);
};

// Starting the activity that is already running changes nothing
export async function dbStartTimer(
  userId: string,
  activityId: string,
  now?: Date,
): Promise<RunningTimer> {
  try {
    return await withUserLock(userId, async (client) => {
      const running = await queryRunningTimer(client, userId);
      if (running?.activityId === activityId) return running;

      const switchTime = await getSwitchTime(client, userId, now);
      await client.query(STOP_RUNNING_SQL, [userId, switchTime]);
      // The foreign key rejects an activity of another user
      const started = await client.query<RunningTimerRow>(
        `INSERT INTO time_entry(user_id, activity_id, started_at)
        VALUES ($1, $2, $3)
        RETURNING activity_id, started_at`,
        [userId, activityId, switchTime],
      );
      return toRunningTimer(started.rows[0])!;
    });
  } catch (error) {
    console.error('DB: Failed to start timer:', error);
    throw new Error('Failed to start timer.');
  }
}

// Returns the stopped timer, or null if nothing was running
export async function dbStopTimer(
  userId: string,
  now?: Date,
): Promise<RunningTimer | null> {
  try {
    return await withUserLock(userId, async (client) => {
      const switchTime = await getSwitchTime(client, userId, now);
      const stopped = await client.query<RunningTimerRow>(STOP_RUNNING_SQL, [
        userId,
        switchTime,
      ]);
      return toRunningTimer(stopped.rows[0]);
    });
  } catch (error) {
    console.error('DB: Failed to stop timer:', error);
    throw new Error('Failed to stop timer.');
  }
}

// Seconds of entry `e` that fall within [range_start, range_end). E.g. an
// entry from 23:00 to 01:00 gives 3600 for the second day.
const SECONDS_IN_RANGE_SQL = `
  -- 0 if the entry and the range don't overlap
  GREATEST(0, EXTRACT(EPOCH FROM
    -- The entry's end, cut to the range. A running entry ends now ($5).
    LEAST(COALESCE(e.ended_at, $5), range_end)
    -- minus the entry's start, cut to the range
    - GREATEST(e.started_at, range_start)
  ))`;

// $1 user id, $2 first day, $3 last day, $4 time zone, $5 now
const rangeParams = (userId: string, range: DayRange) => [
  userId,
  range.from,
  range.to,
  range.timeZone,
  range.now,
];

// Activities without time in the range are left out
const queryTotalsByActivity = async (
  client: VercelPoolClient,
  userId: string,
  range: DayRange,
): Promise<TimeTotals> => {
  const result = await client.query<{ activity_id: string; seconds: number }>(
    `-- The range as exact moments: from midnight of the first day to midnight
      -- after the last day, in the user's time zone
      WITH bounds AS (
        SELECT
          ($2::date::timestamp AT TIME ZONE $4) AS range_start,
          (($3::date + 1)::timestamp AT TIME ZONE $4) AS range_end
      )
      SELECT e.activity_id, FLOOR(SUM(${SECONDS_IN_RANGE_SQL}))::int AS seconds
      FROM time_entry e, bounds
      -- Entries that overlap the range: started before its end and ended (or
      -- are still running) after its start
      WHERE e.user_id=$1
        AND e.started_at < range_end
        AND COALESCE(e.ended_at, $5) > range_start
      GROUP BY e.activity_id`,
    rangeParams(userId, range),
  );

  return Object.fromEntries(
    result.rows.map(({ activity_id, seconds }) => [activity_id, seconds]),
  );
};

// Every day of the range, including days without time
const queryTotalsByDay = async (
  client: VercelPoolClient,
  userId: string,
  range: DayRange,
): Promise<DayTotal[]> => {
  const result = await client.query<DayTotal>(
    `-- A row per day of the range, with its midnights as exact moments in the
    -- user's time zone
    WITH days AS (
      SELECT
        day::date AS day,
        (day AT TIME ZONE $4) AS range_start,
        ((day + interval '1 day') AT TIME ZONE $4) AS range_end
      FROM generate_series(
        $2::date::timestamp, $3::date::timestamp, interval '1 day'
      ) AS day
    )
    SELECT
      to_char(days.day, 'YYYY-MM-DD') AS day,
      -- Without FILTER, the empty row of LEFT JOIN would count the whole
      -- day: GREATEST/LEAST ignore NULLs
      COALESCE(
        FLOOR(SUM(${SECONDS_IN_RANGE_SQL}) FILTER (WHERE e.id IS NOT NULL)),
        0
      )::int AS seconds
    FROM days
    -- Each day joins the entries that overlap it. LEFT JOIN keeps days without
    -- entries, they get 0.
    LEFT JOIN time_entry e
      ON e.user_id=$1
      AND e.started_at < range_end
      AND COALESCE(e.ended_at, $5) > range_start
    GROUP BY days.day
    ORDER BY days.day`,
    rangeParams(userId, range),
  );
  return result.rows;
};

// The running timer and totals are read from one snapshot of the database, so
// the live time added on top of the totals can't count a switch twice
async function readFromSnapshot<T>(
  read: (client: VercelPoolClient) => Promise<T>,
): Promise<T> {
  try {
    return await withSnapshot(read);
  } catch (error) {
    console.error('DB: Failed to read time snapshot:', error);
    throw new Error('Failed to read time snapshot.');
  }
}

export const dbReadTimerAndTotals = (
  userId: string,
  range: DayRange,
): Promise<{ timer: RunningTimer | null; totals: TimeTotals }> =>
  readFromSnapshot(async (client) => ({
    timer: await queryRunningTimer(client, userId),
    totals: await queryTotalsByActivity(client, userId, range),
  }));

export type StatisticsRanges = {
  days: DayRange;
  today: DayRange;
  week: DayRange;
  month: DayRange;
};

export type Statistics = {
  timer: RunningTimer | null;
  days: DayTotal[];
  todayTotals: TimeTotals;
  weekTotals: TimeTotals;
  monthTotals: TimeTotals;
};

export const dbReadTimerAndStatistics = (
  userId: string,
  ranges: StatisticsRanges,
): Promise<Statistics> =>
  readFromSnapshot(async (client) => ({
    timer: await queryRunningTimer(client, userId),
    days: await queryTotalsByDay(client, userId, ranges.days),
    todayTotals: await queryTotalsByActivity(client, userId, ranges.today),
    weekTotals: await queryTotalsByActivity(client, userId, ranges.week),
    monthTotals: await queryTotalsByActivity(client, userId, ranges.month),
  }));
