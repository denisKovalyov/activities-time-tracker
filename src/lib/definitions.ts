export type User = {
  id: string;
  name: string;
  email: string;
  email_verified: Date | null;
  email_verification_token: string | null;
  password: string;
};

export type Credentials = {
  email: string;
  password: string;
};
