export type User = {
  id: string;
  name: string;
  email: string;
  email_verified: Date | null;
  email_verification_token: string | null;
  password: string;
  created_at: Date;
  updated_at: Date;
  last_email_sent_at: Date | string;
};

export type Credentials = {
  email: string;
  password: string;
};
