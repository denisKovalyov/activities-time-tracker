import { createHash, randomBytes } from 'node:crypto';

// The token is random enough, so a plain hash without salt is fine
export const hashToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');

// The token goes to the email, only its hash is saved in the DB
export const generateToken = () => {
  const token = randomBytes(32).toString('hex');

  return { token, tokenHash: hashToken(token) };
};
