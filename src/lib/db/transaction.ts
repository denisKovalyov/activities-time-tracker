import 'server-only';
import { db, type VercelPoolClient } from '@vercel/postgres';

// Runs changes of one user in a transaction, one at a time. Locking the user
// row makes simultaneous requests of the same user (e.g. two clicks from two
// tabs) wait for each other instead of racing.
export async function withUserLock<T>(
  userId: string,
  fn: (client: VercelPoolClient) => Promise<T>,
): Promise<T> {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT id FROM "user" WHERE id=$1 FOR UPDATE', [
      userId,
    ]);
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Runs read-only queries that all see the database as it was at the start of
// the transaction, even if other requests change it meanwhile.
export async function withSnapshot<T>(
  fn: (client: VercelPoolClient) => Promise<T>,
): Promise<T> {
  const client = await db.connect();
  try {
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
