const { db: dbReset } = require('@vercel/postgres');

async function resetDB(client) {
  try {
    // Dependent tables go first. "record" is the table from the old schema.
    await client.sql`DROP TABLE IF EXISTS time_entry`;
    console.log(`Drop "time_entry" table`);
    await client.sql`DROP TABLE IF EXISTS record`;
    console.log(`Drop "record" table`);
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
  await resetDB(client);
  await client.end();
}

main().catch((err) => {
  console.error(
    'An error occurred while attempting to reset the database schema:',
    err,
  );
});
