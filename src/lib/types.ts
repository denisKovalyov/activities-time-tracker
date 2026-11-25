export type User = {
  id: string;
  name: string;
  email: string;
  email_verified: Date | null;
  email_verification_token_hash: string | null;
  email_verification_sent_at: Date | null;
  password_reset_token_hash: string | null;
  password_reset_sent_at: Date | null;
  password: string;
  created_at: Date;
  updated_at: Date;
};

export type Credentials = {
  email: string;
  password: string;
};

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
