export type User = {
  id: string;
  name: string;
  email: string;
  email_verified: Date | null;
  email_verification_token: string | null;
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
  is_archived: boolean;
  order: number;
  created_at: Date;
  updated_at: Date;
}