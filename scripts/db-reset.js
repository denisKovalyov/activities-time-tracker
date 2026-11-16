const { db: dbReset } = require('@vercel/postgres');

async function resetDB(client) {
  try {
    await client.sql`DROP TABLE IF EXISTS time_entry`;
    console.log(`Drop "time_entry" table`);
    await client.sql`DROP TABLE IF EXISTS activity`;
    console.log(`Drop "activity" table`);
    await client.sql`DROP TABLE IF EXISTS "user"`;
    console.log(`Drop "user" table`);
  } catch (error) {
    console.error('Error on dropping table:', error);
    throw error;
  }
}

async function main() {
  const client = await dbReset.connect();
  try {
    await resetDB(client);
  } finally {
    await client.end();
  }
}

// Exported for the integration tests, which reset their own test database
module.exports = { resetDB };

if (require.main === module) {
  main().catch((err) => {
    console.error(
      'An error occurred while attempting to reset the database schema:',
      err,
    );
    // So that `&&` in npm scripts stops after a failure
    process.exitCode = 1;
  });
}
