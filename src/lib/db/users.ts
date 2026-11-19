import 'server-only';
import { sql } from '@vercel/postgres';

import type { Credentials, User } from '@/lib/definitions';

export async function dbGetUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User>`SELECT * FROM "user" WHERE email=${email}`;
    return user.rows[0];
  } catch (error) {
    console.error('DB: nFailed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export async function dbCreateUser({
  email,
  password: hashedPassword,
  emailVerificationTokenHash = null,
  emailVerificationExpiresAt = null,
}: Credentials & {
  emailVerificationTokenHash?: string | null;
  emailVerificationExpiresAt?: Date | null;
}): Promise<User> {
  try {
    const date = new Date().toISOString();

    const result = await sql`
      INSERT INTO "user"(name, email, password, email_verification_token_hash,
        email_verification_expires_at, created_at, updated_at)
      VALUES ('', ${email}, ${hashedPassword}, ${emailVerificationTokenHash},
        ${emailVerificationExpiresAt?.toISOString() ?? null}, ${date}, ${date})
      RETURNING *`;

    return result.rows[0] as User;
  } catch (error) {
    console.error('DB: Failed to create user:', error);
    throw new Error('Failed to create user.');
  }
}

// Checks the cooldown and replaces the token in one query, so parallel requests
// can't send several emails. The previous token's send time is derived from its
// expiry. Returns false if the user is missing, verified or within the cooldown.
export async function dbReplaceEmailVerificationToken(
  email: string,
  tokenHash: string,
  expiresAt: Date,
  cooldownMs: number,
): Promise<boolean> {
  try {
    const latestAllowedExpiry = new Date(expiresAt.getTime() - cooldownMs);
    const result = await sql`
      UPDATE "user"
      SET email_verification_token_hash=${tokenHash},
        email_verification_expires_at=${expiresAt.toISOString()},
        updated_at=now()
      WHERE email=${email} AND email_verified IS NULL
        AND (email_verification_expires_at IS NULL
          OR email_verification_expires_at <= ${latestAllowedExpiry.toISOString()})`;
    return result.rowCount === 1;
  } catch (error) {
    console.error('DB: failed to replace email verification token:', error);
    throw new Error('Failed to replace email verification token.');
  }
}

// Same as dbReplaceEmailVerificationToken. Returns false if the user is missing
// or within the cooldown.
export async function dbReplacePasswordResetToken(
  email: string,
  tokenHash: string,
  expiresAt: Date,
  cooldownMs: number,
): Promise<boolean> {
  try {
    const latestAllowedExpiry = new Date(expiresAt.getTime() - cooldownMs);
    const result = await sql`
      UPDATE "user"
      SET password_reset_token_hash=${tokenHash},
        password_reset_expires_at=${expiresAt.toISOString()},
        updated_at=now()
      WHERE email=${email}
        AND (password_reset_expires_at IS NULL
          OR password_reset_expires_at <= ${latestAllowedExpiry.toISOString()})`;
    return result.rowCount === 1;
  } catch (error) {
    console.error('DB: failed to replace password reset token:', error);
    throw new Error('Failed to replace password reset token.');
  }
}

// Checks the token and uses it up in one query, so a link works only once.
// Returns false if the token doesn't match or has expired.
export async function dbVerifyEmail(
  email: string,
  tokenHash: string,
): Promise<boolean> {
  try {
    const result = await sql`
      UPDATE "user"
      SET email_verified=now(), email_verification_token_hash=NULL,
        email_verification_expires_at=NULL, updated_at=now()
      WHERE email=${email} AND email_verification_token_hash=${tokenHash}
        AND email_verification_expires_at > now()`;
    return result.rowCount === 1;
  } catch (error) {
    console.error('DB: failed to verify email:', error);
    throw new Error('Failed to verify email.');
  }
}

export async function dbIsPasswordResetTokenValid(
  email: string,
  tokenHash: string,
): Promise<boolean> {
  try {
    const result = await sql`
      SELECT 1 FROM "user"
      WHERE email=${email} AND password_reset_token_hash=${tokenHash}
        AND password_reset_expires_at > now()`;
    return result.rowCount === 1;
  } catch (error) {
    console.error('DB: failed to check password reset token:', error);
    throw new Error('Failed to check password reset token.');
  }
}

// Same as dbVerifyEmail: one query, so a link works only once
export async function dbResetPassword(
  email: string,
  tokenHash: string,
  hashedPassword: string,
): Promise<boolean> {
  try {
    const result = await sql`
      UPDATE "user"
      SET password=${hashedPassword}, password_reset_token_hash=NULL,
        password_reset_expires_at=NULL, updated_at=now()
      WHERE email=${email} AND password_reset_token_hash=${tokenHash}
        AND password_reset_expires_at > now()`;
    return result.rowCount === 1;
  } catch (error) {
    console.error('DB: failed to reset password:', error);
    throw new Error('Failed to reset password.');
  }
}

export async function dbDeleteUser(id: string): Promise<void> {
  try {
    await sql`DELETE FROM "user" WHERE id = ${id}`;
  } catch (error) {
    console.error('DB: failed to delete user:', error);
    throw new Error('Failed to delete user.');
  }
}
