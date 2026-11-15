import { randomBytes } from 'node:crypto';

export const generateEmailVerificationToken = () => {
  return randomBytes(32).toString('hex');
};
