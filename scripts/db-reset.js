const { db: dbReset } = require('@vercel/postgres');

async function resetDB(client) {
  try {
    await client.sql`DROP TABLE IF EXISTS "user"`;
    console.log(`Drop "user" table`);
    await client.sql`DROP TABLE IF EXISTS activity`;
    console.log(`Drop "activity" table`);
    await client.sql`DROP TABLE IF EXISTS record`;
    console.log(`Drop "record" table`);
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
