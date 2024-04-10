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
      INSERT INTO users(name, email, password, email_verification_token)
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
      (str, [field, value], i) => `${str ? str + ', ' : ''}${field}=$${i + 1}`,
      '',
    );

    await sql.query(
      `UPDATE users SET ${fieldsString} WHERE email='${email}'`,
      Object.values(fields),
    );
  } catch (error) {
    console.error('Failed to update user:', error);
    throw new Error('Failed to update user.');
  }
}
