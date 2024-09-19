const { db: dbReset } = require('@vercel/postgres');

async function resetDB(client) {
  try {
    await client.sql`DROP TABLE IF EXISTS activities`;
    console.log(`Drop "activities" table`);
    await client.sql`DROP TABLE IF EXISTS records`;
    console.log(`Drop "records" table`);
    await client.sql`DROP TABLE IF EXISTS users`;
    console.log(`Drop "users" table`);
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
