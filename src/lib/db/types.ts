export type Activity = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  position: string;
  is_archived: boolean;
  created_at: Date;
  updated_at: Date;
};

export type ActivityFields = Pick<Activity, 'name' | 'color' | 'icon'>;

export type RunningTimer = {
  activityId: string;
  startedAt: Date;
};

// Seconds spent per activity id
export type TimeTotals = Record<string, number>;

export type DayTotal = {
  day: string;
  seconds: number;
};

// A range of calendar days (inclusive) in the user's time zone. `now` is the
// moment running timers are counted up to, so callers that show live time
// can continue from exactly the same point.
export type DayRange = {
  from: string;
  to: string;
  timeZone: string;
  now: Date;
};
