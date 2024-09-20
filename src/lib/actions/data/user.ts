import type { Credentials, User } from '@/lib/definitions';
import { sql } from '@vercel/postgres';
import { getUpdatedFields } from '@/lib/actions/data/utils';

export async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User>`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0];
  } catch (error) {
    console.error('DB: nFailed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export async function createUser({
  email,
  password: hashedPassword,
  emailVerificationToken,
}: Credentials & { emailVerificationToken: string }): Promise<void> {
  try {
    const date = new Date().toISOString();

    await sql`
      INSERT INTO users(name, email, password, email_verification_token, created_at, updated_at)
      VALUES ('', ${email}, ${hashedPassword}, ${emailVerificationToken}, ${date}, ${date})`;
  } catch (error) {
    console.error('DB: Failed to create user:', error);
    throw new Error('Failed to create user.');
  }
}

export async function updateUser(
  email: string,
  fields: Partial<User>,
): Promise<void> {
  try {
    const updatedFields = {
      ...fields,
      updated_at: new Date().toISOString(),
    };

    const fieldsString = getUpdatedFields(updatedFields);

    await sql.query(
      `UPDATE users SET ${fieldsString} WHERE email='${email}'`,
      Object.values(updatedFields),
    );
  } catch (error) {
    console.error('DB: failed to update user:', error);
    throw new Error('Failed to update user.');
  }
}
