import type { Credentials, User } from '@/lib/definitions';
import { sql } from '@vercel/postgres';
import { getUpdatedFields } from '@/lib/actions/data/utils';

export async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User>`SELECT * FROM "user" WHERE email=${email}`;
    return user.rows[0];
  } catch (error) {
    console.error('DB: nFailed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export async function createUser({
  email,
  password: hashedPassword,
  emailVerificationToken = null,
}: Credentials & { emailVerificationToken?: string | null }): Promise<User> {
  try {
    const date = new Date().toISOString();

    const result = await sql`
      INSERT INTO "user"(name, email, password, email_verification_token, created_at, updated_at)
      VALUES ('', ${email}, ${hashedPassword}, ${emailVerificationToken}, ${date}, ${date})
      RETURNING *`;

    return result.rows[0] as User;
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
      `UPDATE "user" SET ${fieldsString} WHERE email='${email}'`,
      Object.values(updatedFields),
    );
  } catch (error) {
    console.error('DB: failed to update user:', error);
    throw new Error('Failed to update user.');
  }
}

export async function deleteUser(
  id: string,
): Promise<void> {
  try {
    await sql`DELETE FROM "user" WHERE id = ${id}`;
  } catch (error) {
    console.error('DB: failed to delete user:', error);
    throw new Error('Failed to delete user.');
  }
}
