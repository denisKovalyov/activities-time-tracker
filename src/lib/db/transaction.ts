import 'server-only';
import { db, type VercelPoolClient } from '@vercel/postgres';

// A transaction holding a lock on the user row, so simultaneous changes of
// one user (e.g. clicks in two tabs) wait for each other instead of racing.
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

// Read-only queries that all see the database as it was when they started
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
