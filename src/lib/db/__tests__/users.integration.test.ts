import { beforeEach, describe, expect, it } from 'vitest';

import { resetPassword, verifyEmail } from '@/lib/db/users';
import { clearDatabase, createUser, query } from '@/test/integration/helpers';

const EMAIL = 'user@test.com';
const OTHER_EMAIL = 'other@test.com';
const TOKEN_HASH = 'token-hash';
const FUTURE = "now() + interval '1 hour'";
const PAST = "now() - interval '1 minute'";

// Column names and expiry are interpolated: they come from the tests only
const setToken = (
  kind: 'email_verification' | 'password_reset',
  tokenHash: string | null,
  { email = EMAIL, expiresAt = FUTURE } = {},
) =>
  query(
    `UPDATE "user"
    SET ${kind}_token_hash=$1, ${kind}_expires_at=${expiresAt}
    WHERE email=$2`,
    [tokenHash, email],
  );

const getUserRow = async (email = EMAIL) => {
  const [user] = await query<{
    password: string;
    email_verified: Date | null;
    email_verification_token_hash: string | null;
    email_verification_expires_at: Date | null;
    password_reset_token_hash: string | null;
    password_reset_expires_at: Date | null;
  }>(
    `SELECT password, email_verified, email_verification_token_hash,
      email_verification_expires_at, password_reset_token_hash,
      password_reset_expires_at
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

describe('resetPassword', () => {
  beforeEach(() => setToken('password_reset', TOKEN_HASH));

  it('saves the password and uses up the token', async () => {
    expect(await resetPassword(EMAIL, TOKEN_HASH, 'new-hash')).toBe(true);

    expect(await getUserRow()).toMatchObject({
      password: 'new-hash',
      password_reset_token_hash: null,
      password_reset_expires_at: null,
    });
  });

  it('works only once', async () => {
    await resetPassword(EMAIL, TOKEN_HASH, 'new-hash');

    expect(await resetPassword(EMAIL, TOKEN_HASH, 'attacker-hash')).toBe(false);
    expect((await getUserRow()).password).toBe('new-hash');
  });

  it('rejects a wrong token', async () => {
    expect(await resetPassword(EMAIL, 'wrong', 'attacker-hash')).toBe(false);

    expect(await getUserRow()).toMatchObject({
      password: '',
      password_reset_token_hash: TOKEN_HASH,
    });
  });

  it('rejects an expired token', async () => {
    await setToken('password_reset', TOKEN_HASH, { expiresAt: PAST });

    expect(await resetPassword(EMAIL, TOKEN_HASH, 'attacker-hash')).toBe(false);
    expect((await getUserRow()).password).toBe('');
  });

  it('rejects any token when the user has none', async () => {
    await setToken('password_reset', null);

    expect(await resetPassword(EMAIL, '', 'attacker-hash')).toBe(false);
    expect(await resetPassword(EMAIL, 'null', 'attacker-hash')).toBe(false);
    expect((await getUserRow()).password).toBe('');
  });

  it('rejects the email verification token', async () => {
    await setToken('password_reset', null);
    await setToken('email_verification', TOKEN_HASH);

    expect(await resetPassword(EMAIL, TOKEN_HASH, 'attacker-hash')).toBe(false);
    expect((await getUserRow()).password).toBe('');
  });

  it('rejects the token of another user', async () => {
    await setToken('password_reset', 'other-hash', { email: OTHER_EMAIL });

    expect(await resetPassword(EMAIL, 'other-hash', 'attacker-hash')).toBe(
      false,
    );
    expect((await getUserRow()).password).toBe('');
    expect((await getUserRow(OTHER_EMAIL)).password).toBe('');
  });
});

describe('verifyEmail', () => {
  beforeEach(() => setToken('email_verification', TOKEN_HASH));

  it('verifies the email and uses up the token', async () => {
    expect(await verifyEmail(EMAIL, TOKEN_HASH)).toBe(true);

    const user = await getUserRow();
    expect(user.email_verified).toBeInstanceOf(Date);
    expect(user).toMatchObject({
      email_verification_token_hash: null,
      email_verification_expires_at: null,
    });
  });

  it('works only once', async () => {
    await verifyEmail(EMAIL, TOKEN_HASH);

    expect(await verifyEmail(EMAIL, TOKEN_HASH)).toBe(false);
  });

  it('rejects a wrong token', async () => {
    expect(await verifyEmail(EMAIL, 'wrong')).toBe(false);
    expect((await getUserRow()).email_verified).toBeNull();
  });

  it('rejects an expired token', async () => {
    await setToken('email_verification', TOKEN_HASH, { expiresAt: PAST });

    expect(await verifyEmail(EMAIL, TOKEN_HASH)).toBe(false);
    expect((await getUserRow()).email_verified).toBeNull();
  });

  it('rejects the password reset token', async () => {
    await setToken('email_verification', null);
    await setToken('password_reset', TOKEN_HASH);

    expect(await verifyEmail(EMAIL, TOKEN_HASH)).toBe(false);
    expect((await getUserRow()).email_verified).toBeNull();
  });

  it('rejects the token of another user', async () => {
    await setToken('email_verification', 'other-hash', { email: OTHER_EMAIL });

    expect(await verifyEmail(EMAIL, 'other-hash')).toBe(false);
    expect((await getUserRow()).email_verified).toBeNull();
    expect((await getUserRow(OTHER_EMAIL)).email_verified).toBeNull();
  });
});
