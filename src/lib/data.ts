import type { Credentials, User } from '@/lib/definitions';
import { sql } from '@vercel/postgres';

export async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User>`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export async function createUser({
  email,
  password: hashedPassword,
  emailVerificationToken,
}: Credentials & { emailVerificationToken: string }): Promise<void> {
  try {
    await sql`
      INSERT INTO users(name, email, password, emailVerificationToken)
      VALUES ('', ${email}, ${hashedPassword}, ${emailVerificationToken})`;
  } catch (error) {
    console.error('Failed to create user:', error);
    throw new Error('Failed to create user.');
  }
}

export async function updateUser(
  email: string,
  fields: Partial<User>,
): Promise<void> {
  try {
    const fieldsString = Object.entries(fields).reduce(
      (str, [field, value]) => `${str ? str + ', ' : ''}${field}='${value}'`,
      '');

    await sql`UPDATE users SET ${fieldsString} WHERE email = ${email}`;
  } catch (error) {
    console.error('Failed to update user:', error);
    throw new Error('Failed to update user.');
  }
}
