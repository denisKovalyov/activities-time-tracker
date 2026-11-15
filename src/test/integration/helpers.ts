import { pool } from './vercel-postgres';

export const query = <T = Record<string, unknown>>(
  text: string,
  values: unknown[] = [],
) => pool.query(text, values).then(({ rows }) => rows as T[]);

export const clearDatabase = () =>
  query('TRUNCATE time_entry, activity, "user" CASCADE');

export const createUser = async (email: string) => {
  const [user] = await query<{ id: string }>(
    `INSERT INTO "user"(name, email, password, created_at, updated_at)
    VALUES ('', $1, '', now(), now())
    RETURNING id`,
    [email],
  );
  return user.id;
};
