import { beforeEach, describe, expect, it } from 'vitest';

import {
  dbCreateUser,
  dbReplaceEmailVerificationToken,
  dbReplacePasswordResetToken,
  dbResetPassword,
  dbVerifyEmail,
} from '@/lib/db/users';
import { clearDatabase, createUser, query } from '@/test/integration/helpers';

const EMAIL = 'user@test.com';
const OTHER_EMAIL = 'other@test.com';
const TOKEN_HASH = 'token-hash';
// The cooldown is 5 minutes, verification links live 1 day, reset links 1 hour
const SENT_2_MINUTES_AGO = "now() - interval '2 minutes'";
const SENT_10_MINUTES_AGO = "now() - interval '10 minutes'";
const SENT_50_MINUTES_AGO = "now() - interval '50 minutes'";
const SENT_2_HOURS_AGO = "now() - interval '2 hours'";
const SENT_23_HOURS_AGO = "now() - interval '23 hours'";
const SENT_2_DAYS_AGO = "now() - interval '2 days'";

const replaceToken = (email = EMAIL, tokenHash = 'new-hash') =>
  dbReplaceEmailVerificationToken(email, tokenHash);

const replaceResetToken = (email = EMAIL, tokenHash = 'new-hash') =>
  dbReplacePasswordResetToken(email, tokenHash);

// Column names and sent time are interpolated: they come from the tests only
const setToken = (
  kind: 'email_verification' | 'password_reset',
  tokenHash: string | null,
  { email = EMAIL, sentAt = 'now()' } = {},
) =>
  query(
    `UPDATE "user"
    SET ${kind}_token_hash=$1, ${kind}_sent_at=${sentAt}
    WHERE email=$2`,
    [tokenHash, email],
  );

const getUserRow = async (email = EMAIL) => {
  const [user] = await query<{
    password: string;
    email_verified: Date | null;
    email_verification_token_hash: string | null;
    email_verification_sent_at: Date | null;
    password_reset_token_hash: string | null;
    password_reset_sent_at: Date | null;
  }>(
    `SELECT password, email_verified, email_verification_token_hash,
      email_verification_sent_at, password_reset_token_hash,
      password_reset_sent_at
    FROM "user" WHERE email=$1`,
    [email],
  );
  return user;
};

beforeEach(async () => {
  await clearDatabase();
  await createUser(EMAIL);
  await createUser(OTHER_EMAIL);
});

describe('dbCreateUser', () => {
  it('creates an unverified user by default', async () => {
    await dbCreateUser({ email: 'new@test.com', password: 'hash' });

    expect((await getUserRow('new@test.com')).email_verified).toBeNull();
  });

  it('creates a verified user', async () => {
    await dbCreateUser({
      email: 'new@test.com',
      password: '',
      emailVerified: new Date(),
    });

    expect((await getUserRow('new@test.com')).email_verified).toBeInstanceOf(
      Date,
    );
  });

  it('saves when the verification email was sent', async () => {
    await dbCreateUser({
      email: 'new@test.com',
      password: 'hash',
      emailVerificationTokenHash: TOKEN_HASH,
    });

    expect(await getUserRow('new@test.com')).toMatchObject({
      email_verification_token_hash: TOKEN_HASH,
      email_verification_sent_at: expect.any(Date),
    });
  });

  it('leaves the sent time empty without a token', async () => {
    await dbCreateUser({ email: 'new@test.com', password: 'hash' });

    expect(
      (await getUserRow('new@test.com')).email_verification_sent_at,
    ).toBeNull();
  });
});

describe('dbResetPassword', () => {
  beforeEach(() => setToken('password_reset', TOKEN_HASH));

  it('saves the password and uses up the token', async () => {
    expect(await dbResetPassword(EMAIL, TOKEN_HASH, 'new-hash')).toBe(true);

    expect(await getUserRow()).toMatchObject({
      password: 'new-hash',
      password_reset_token_hash: null,
      password_reset_sent_at: null,
    });
  });

  it('works only once', async () => {
    await dbResetPassword(EMAIL, TOKEN_HASH, 'new-hash');

    expect(await dbResetPassword(EMAIL, TOKEN_HASH, 'attacker-hash')).toBe(
      false,
    );
    expect((await getUserRow()).password).toBe('new-hash');
  });

  it('rejects a wrong token', async () => {
    expect(await dbResetPassword(EMAIL, 'wrong', 'attacker-hash')).toBe(false);

    expect(await getUserRow()).toMatchObject({
      password: '',
      password_reset_token_hash: TOKEN_HASH,
    });
  });

  it('accepts a link sent less than an hour ago', async () => {
    await setToken('password_reset', TOKEN_HASH, {
      sentAt: SENT_50_MINUTES_AGO,
    });

    expect(await dbResetPassword(EMAIL, TOKEN_HASH, 'new-hash')).toBe(true);
  });

  it('rejects an expired token', async () => {
    await setToken('password_reset', TOKEN_HASH, { sentAt: SENT_2_HOURS_AGO });

    expect(await dbResetPassword(EMAIL, TOKEN_HASH, 'attacker-hash')).toBe(
      false,
    );
    expect((await getUserRow()).password).toBe('');
  });

  it('rejects any token when the user has none', async () => {
    await setToken('password_reset', null);

    expect(await dbResetPassword(EMAIL, '', 'attacker-hash')).toBe(false);
    expect(await dbResetPassword(EMAIL, 'null', 'attacker-hash')).toBe(false);
    expect((await getUserRow()).password).toBe('');
  });

  it('rejects the email verification token', async () => {
    await setToken('password_reset', null);
    await setToken('email_verification', TOKEN_HASH);

    expect(await dbResetPassword(EMAIL, TOKEN_HASH, 'attacker-hash')).toBe(
      false,
    );
    expect((await getUserRow()).password).toBe('');
  });

  it('rejects the token of another user', async () => {
    await setToken('password_reset', 'other-hash', { email: OTHER_EMAIL });

    expect(await dbResetPassword(EMAIL, 'other-hash', 'attacker-hash')).toBe(
      false,
    );
    expect((await getUserRow()).password).toBe('');
    expect((await getUserRow(OTHER_EMAIL)).password).toBe('');
  });
});

describe('dbReplaceEmailVerificationToken', () => {
  it('replaces a token sent before the cooldown', async () => {
    await setToken('email_verification', TOKEN_HASH, {
      sentAt: SENT_10_MINUTES_AGO,
    });

    expect(await replaceToken()).toBe(true);
    expect((await getUserRow()).email_verification_token_hash).toBe('new-hash');
  });

  it('sets a token when the user has none', async () => {
    expect(await replaceToken()).toBe(true);
    expect((await getUserRow()).email_verification_token_hash).toBe('new-hash');
  });

  it('keeps a token sent within the cooldown', async () => {
    await setToken('email_verification', TOKEN_HASH, {
      sentAt: SENT_2_MINUTES_AGO,
    });

    expect(await replaceToken()).toBe(false);
    expect((await getUserRow()).email_verification_token_hash).toBe(TOKEN_HASH);
  });

  it('lets only one of parallel requests through', async () => {
    const results = await Promise.all([
      replaceToken(EMAIL, 'first-hash'),
      replaceToken(EMAIL, 'second-hash'),
    ]);

    expect(results.filter(Boolean)).toHaveLength(1);
  });

  it('rejects a verified user', async () => {
    await query(`UPDATE "user" SET email_verified=now() WHERE email=$1`, [
      EMAIL,
    ]);

    expect(await replaceToken()).toBe(false);
    expect((await getUserRow()).email_verification_token_hash).toBeNull();
  });

  it('rejects an unknown email', async () => {
    expect(await replaceToken('unknown@test.com')).toBe(false);
  });

  it('does not touch other users', async () => {
    await replaceToken();

    expect(
      (await getUserRow(OTHER_EMAIL)).email_verification_token_hash,
    ).toBeNull();
  });
});

describe('dbReplacePasswordResetToken', () => {
  it('replaces a token sent before the cooldown', async () => {
    await setToken('password_reset', TOKEN_HASH, {
      sentAt: SENT_10_MINUTES_AGO,
    });

    expect(await replaceResetToken()).toBe(true);
    expect((await getUserRow()).password_reset_token_hash).toBe('new-hash');
  });

  it('sets a token when the user has none', async () => {
    expect(await replaceResetToken()).toBe(true);
    expect((await getUserRow()).password_reset_token_hash).toBe('new-hash');
  });

  it('keeps a token sent within the cooldown', async () => {
    await setToken('password_reset', TOKEN_HASH, {
      sentAt: SENT_2_MINUTES_AGO,
    });

    expect(await replaceResetToken()).toBe(false);
    expect((await getUserRow()).password_reset_token_hash).toBe(TOKEN_HASH);
  });

  it('lets only one of parallel requests through', async () => {
    const results = await Promise.all([
      replaceResetToken(EMAIL, 'first-hash'),
      replaceResetToken(EMAIL, 'second-hash'),
    ]);

    expect(results.filter(Boolean)).toHaveLength(1);
  });

  it('works for a verified user', async () => {
    await query(`UPDATE "user" SET email_verified=now() WHERE email=$1`, [
      EMAIL,
    ]);

    expect(await replaceResetToken()).toBe(true);
  });

  it('rejects an unknown email', async () => {
    expect(await replaceResetToken('unknown@test.com')).toBe(false);
  });

  it('does not touch other users', async () => {
    await replaceResetToken();

    expect(
      (await getUserRow(OTHER_EMAIL)).password_reset_token_hash,
    ).toBeNull();
  });
});

describe('dbVerifyEmail', () => {
  beforeEach(() => setToken('email_verification', TOKEN_HASH));

  it('verifies the email and uses up the token', async () => {
    expect(await dbVerifyEmail(EMAIL, TOKEN_HASH)).toBe(true);

    const user = await getUserRow();
    expect(user.email_verified).toBeInstanceOf(Date);
    expect(user).toMatchObject({
      email_verification_token_hash: null,
      email_verification_sent_at: null,
    });
  });

  it('works only once', async () => {
    await dbVerifyEmail(EMAIL, TOKEN_HASH);

    expect(await dbVerifyEmail(EMAIL, TOKEN_HASH)).toBe(false);
  });

  it('rejects a wrong token', async () => {
    expect(await dbVerifyEmail(EMAIL, 'wrong')).toBe(false);
    expect((await getUserRow()).email_verified).toBeNull();
  });

  it('accepts a link sent less than a day ago', async () => {
    await setToken('email_verification', TOKEN_HASH, {
      sentAt: SENT_23_HOURS_AGO,
    });

    expect(await dbVerifyEmail(EMAIL, TOKEN_HASH)).toBe(true);
  });

  it('rejects an expired token', async () => {
    await setToken('email_verification', TOKEN_HASH, {
      sentAt: SENT_2_DAYS_AGO,
    });

    expect(await dbVerifyEmail(EMAIL, TOKEN_HASH)).toBe(false);
    expect((await getUserRow()).email_verified).toBeNull();
  });

  it('rejects the password reset token', async () => {
    await setToken('email_verification', null);
    await setToken('password_reset', TOKEN_HASH);

    expect(await dbVerifyEmail(EMAIL, TOKEN_HASH)).toBe(false);
    expect((await getUserRow()).email_verified).toBeNull();
  });

  it('rejects the token of another user', async () => {
    await setToken('email_verification', 'other-hash', { email: OTHER_EMAIL });

    expect(await dbVerifyEmail(EMAIL, 'other-hash')).toBe(false);
    expect((await getUserRow()).email_verified).toBeNull();
    expect((await getUserRow(OTHER_EMAIL)).email_verified).toBeNull();
  });
});
