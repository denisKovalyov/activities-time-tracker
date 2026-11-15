// Stand-in for @vercel/postgres in integration tests. @vercel/postgres talks
// to Neon over WebSockets and can't connect to a plain Postgres, so
// vitest.integration.config.mts aliases it to this adapter built on `pg`.
import { Pool, type PoolClient, type QueryResultRow } from 'pg';

import { TEST_DATABASE_URL } from './database-url';

export const pool = new Pool({ connectionString: TEST_DATABASE_URL });

// sql`... ${value}` -> 'SELECT ... $1', [value]
const toText = (strings: TemplateStringsArray) =>
  strings
    .slice(1)
    .reduce((text, part, i) => `${text}$${i + 1}${part}`, strings[0]);

const withSqlTag = (client: Pool | PoolClient) =>
  Object.assign(
    <O extends QueryResultRow>(
      strings: TemplateStringsArray,
      ...values: unknown[]
    ) => client.query<O>(toText(strings), values),
    {
      query: <O extends QueryResultRow>(text: string, values?: unknown[]) =>
        client.query<O>(text, values),
    },
  );

export const sql = withSqlTag(pool);

export const db = {
  connect: async () => {
    const client = await pool.connect();
    return Object.assign(client, { sql: withSqlTag(client) });
  },
};
