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

// Puts the activity right after `previousId` (null means the top)
export type Move = { id: string; previousId: string | null };

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

// Calendar days (inclusive) in the user's time zone. A running timer is
// counted up to `now`.
export type DayRange = {
  from: string;
  to: string;
  timeZone: string;
  now: Date;
};
