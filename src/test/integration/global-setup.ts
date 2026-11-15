import { createRequire } from 'node:module';
import pg from 'pg';

import { TEST_DATABASE_URL, assertLocalDatabase } from './database-url';

const require = createRequire(import.meta.url);
const { resetDB } = require('../../../scripts/db-reset.js');
const { setupDB } = require('../../../scripts/db-setup.js');

// Recreates the schema with the same scripts as `npm run db:restart`.
export default async function setup() {
  assertLocalDatabase();

  const client = new pg.Client({ connectionString: TEST_DATABASE_URL });
  await client.connect();
  // The scripts use the sql`` tag of @vercel/postgres; their queries have
  // no parameters, so the raw template text is the whole query.
  const sql = (strings: TemplateStringsArray) => client.query(strings.join(''));

  const log = console.log;
  console.log = () => {};
  try {
    await resetDB({ sql });
    await setupDB({ sql });
  } finally {
    console.log = log;
    await client.end();
  }
}
