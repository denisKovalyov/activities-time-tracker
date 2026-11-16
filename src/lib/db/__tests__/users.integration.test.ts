import { beforeEach, describe, expect, it } from 'vitest';

import { resetPassword } from '@/lib/db/users';
import { clearDatabase, createUser, query } from '@/test/integration/helpers';

const EMAIL = 'user@test.com';
const TOKEN = 'reset-token';

const setToken = (token: string | null, email = EMAIL) =>
  query('UPDATE "user" SET email_verification_token=$1 WHERE email=$2', [
    token,
    email,
  ]);

const getUserRow = async (email = EMAIL) => {
  const [user] = await query<{
    password: string;
    email_verification_token: string | null;
  }>('SELECT password, email_verification_token FROM "user" WHERE email=$1', [
    email,
  ]);
  return user;
};

beforeEach(async () => {
  await clearDatabase();
  await createUser(EMAIL);
  await createUser('other@test.com');
  await setToken(TOKEN);
});

describe('resetPassword', () => {
  it('saves the password and uses up the token', async () => {
    expect(await resetPassword(EMAIL, TOKEN, 'new-hash')).toBe(true);

    expect(await getUserRow()).toEqual({
      password: 'new-hash',
      email_verification_token: null,
    });
  });

  it('works only once', async () => {
    await resetPassword(EMAIL, TOKEN, 'new-hash');

    expect(await resetPassword(EMAIL, TOKEN, 'attacker-hash')).toBe(false);
    expect((await getUserRow()).password).toBe('new-hash');
  });

  it('rejects a wrong token', async () => {
    expect(await resetPassword(EMAIL, 'wrong', 'attacker-hash')).toBe(false);

    expect(await getUserRow()).toEqual({
      password: '',
      email_verification_token: TOKEN,
    });
  });

  it('rejects any token when the user has none', async () => {
    await setToken(null);

    expect(await resetPassword(EMAIL, '', 'attacker-hash')).toBe(false);
    expect(await resetPassword(EMAIL, 'null', 'attacker-hash')).toBe(false);
    expect((await getUserRow()).password).toBe('');
  });

  it('rejects the token of another user', async () => {
    await setToken('other-token', 'other@test.com');

    expect(await resetPassword(EMAIL, 'other-token', 'attacker-hash')).toBe(
      false,
    );
    expect((await getUserRow()).password).toBe('');
    expect((await getUserRow('other@test.com')).password).toBe('');
  });
});
