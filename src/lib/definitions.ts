export type User = {
  id: string;
  name: string;
  email: string;
  email_verified: Date | null;
  email_verification_token_hash: string | null;
  email_verification_expires_at: Date | null;
  password_reset_token_hash: string | null;
  password_reset_expires_at: Date | null;
  password: string;
  created_at: Date;
  updated_at: Date;
};

export type Credentials = {
  email: string;
  password: string;
};
