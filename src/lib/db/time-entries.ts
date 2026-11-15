import 'server-only';
import { db, sql, type VercelPoolClient } from '@vercel/postgres';

import type {
  DayRange,
  DayTotal,
  RunningTimer,
  TimeTotals,
} from '@/lib/db/types';

type RunningTimerRow = { activity_id: string; started_at: Date };

const toRunningTimer = (row?: RunningTimerRow): RunningTimer | null =>
  row ? { activityId: row.activity_id, startedAt: row.started_at } : null;

// Runs timer changes of one user in a transaction, one at a time. Locking the
// user row makes two simultaneous clicks (e.g. from two tabs) wait for each
// other instead of racing.
async function withUserLock<T>(
  userId: string,
  fn: (client: VercelPoolClient) => Promise<T>,
): Promise<T> {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT id FROM "user" WHERE id=$1 FOR UPDATE', [
      userId,
    ]);
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// GREATEST protects the CHECK constraint if `now` is slightly behind the
// start time (e.g. the timer was started a moment ago by another server).
const STOP_RUNNING_SQL = `
  UPDATE time_entry SET ended_at = GREATEST($2, started_at)
  WHERE user_id=$1 AND ended_at IS NULL
  RETURNING activity_id, started_at`;

export async function getRunningTimer(
  userId: string,
): Promise<RunningTimer | null> {
  try {
    const result = await sql<RunningTimerRow>`
      SELECT activity_id, started_at FROM time_entry
      WHERE user_id=${userId} AND ended_at IS NULL`;
    return toRunningTimer(result.rows[0]);
  } catch (error) {
    console.error('DB: Failed to fetch running timer:', error);
    throw new Error('Failed to fetch running timer.');
  }
}

// Stops the running timer (if any) and starts a new one for the activity.
// Starting the activity that is already running changes nothing.
export async function startTimer(
  userId: string,
  activityId: string,
  now: Date = new Date(),
): Promise<RunningTimer> {
  try {
    return await withUserLock(userId, async (client) => {
      const running = await client.query<RunningTimerRow>(
        `SELECT activity_id, started_at FROM time_entry
        WHERE user_id=$1 AND ended_at IS NULL`,
        [userId],
      );
      if (running.rows[0]?.activity_id === activityId) {
        return toRunningTimer(running.rows[0])!;
      }

      await client.query(STOP_RUNNING_SQL, [userId, now]);
      // The foreign key rejects an activity of another user
      const started = await client.query<RunningTimerRow>(
        `INSERT INTO time_entry(user_id, activity_id, started_at)
        VALUES ($1, $2, $3)
        RETURNING activity_id, started_at`,
        [userId, activityId, now],
      );
      return toRunningTimer(started.rows[0])!;
    });
  } catch (error) {
    console.error('DB: Failed to start timer:', error);
    throw new Error('Failed to start timer.');
  }
}

// Returns the timer that was stopped, or null if nothing was running.
export async function stopTimer(
  userId: string,
  now: Date = new Date(),
): Promise<RunningTimer | null> {
  try {
    return await withUserLock(userId, async (client) => {
      const stopped = await client.query<RunningTimerRow>(STOP_RUNNING_SQL, [
        userId,
        now,
      ]);
      return toRunningTimer(stopped.rows[0]);
    });
  } catch (error) {
    console.error('DB: Failed to stop timer:', error);
    throw new Error('Failed to stop timer.');
  }
}

// Seconds of a time entry `e` that fall into [range_start, range_end).
// A running entry (ended_at IS NULL) is counted up to `now` ($5).
const OVERLAP_SECONDS_SQL = `GREATEST(0, EXTRACT(EPOCH FROM
  LEAST(COALESCE(e.ended_at, $5), range_end) - GREATEST(e.started_at, range_start)
))`;

// Parameters shared by the totals queries:
// $1 user id, $2 first day, $3 last day, $4 time zone, $5 now.
const rangeParams = (userId: string, range: DayRange) => [
  userId,
  range.from,
  range.to,
  range.timeZone,
  range.now,
];

// Seconds spent on each activity during the days of the range.
// Activities without any time in the range are not included.
export async function getTotalsByActivity(
  userId: string,
  range: DayRange,
): Promise<TimeTotals> {
  try {
    const result = await sql.query<{ activity_id: string; seconds: number }>(
      `WITH bounds AS (
        SELECT
          ($2::date::timestamp AT TIME ZONE $4) AS range_start,
          (($3::date + 1)::timestamp AT TIME ZONE $4) AS range_end
      )
      SELECT e.activity_id, FLOOR(SUM(${OVERLAP_SECONDS_SQL}))::int AS seconds
      FROM time_entry e, bounds
      WHERE e.user_id=$1
        AND e.started_at < range_end
        AND COALESCE(e.ended_at, $5) > range_start
      GROUP BY e.activity_id`,
      rangeParams(userId, range),
    );

    return Object.fromEntries(
      result.rows.map(({ activity_id, seconds }) => [activity_id, seconds]),
    );
  } catch (error) {
    console.error('DB: Failed to fetch totals by activity:', error);
    throw new Error('Failed to fetch totals by activity.');
  }
}

// Seconds spent on all activities for every day of the range, including
// days without any time (0 seconds).
export async function getTotalsByDay(
  userId: string,
  range: DayRange,
): Promise<DayTotal[]> {
  try {
    const result = await sql.query<DayTotal>(
      `WITH days AS (
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
        -- FILTER skips the empty row LEFT JOIN gives for a day without
        -- entries: GREATEST/LEAST ignore NULLs and would count the whole day.
        COALESCE(
          FLOOR(SUM(${OVERLAP_SECONDS_SQL}) FILTER (WHERE e.id IS NOT NULL)),
          0
        )::int AS seconds
      FROM days
      LEFT JOIN time_entry e
        ON e.user_id=$1
        AND e.started_at < range_end
        AND COALESCE(e.ended_at, $5) > range_start
      GROUP BY days.day
      ORDER BY days.day`,
      rangeParams(userId, range),
    );
    return result.rows;
  } catch (error) {
    console.error('DB: Failed to fetch totals by day:', error);
    throw new Error('Failed to fetch totals by day.');
  }
}
