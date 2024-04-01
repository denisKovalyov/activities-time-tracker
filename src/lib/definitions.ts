export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: Date | null;
  password: string;
};

export type Credentials = {
  email: string;
  password: string;
};
