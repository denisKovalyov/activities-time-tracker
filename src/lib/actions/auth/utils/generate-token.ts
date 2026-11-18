import { createHash, randomBytes } from 'node:crypto';

export const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
export const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;
export const EMAIL_RESEND_COOLDOWN_MS = 5 * 60 * 1000;

// The token is random enough, so a plain hash without salt is fine
export const hashToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');

// The token goes to the email, only its hash is saved in the DB
export const generateToken = (ttlMs: number) => {
  const token = randomBytes(32).toString('hex');

  return {
    token,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + ttlMs),
  };
};
