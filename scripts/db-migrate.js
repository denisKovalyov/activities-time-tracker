const { db: dbReset } = require('@vercel/postgres');

async function emptyMigration(client) {
  try {
    // Execute sql code
    await client.sql``;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function main() {
  const client = await dbReset.connect();
  await emptyMigration(client);
  await client.end();
}

main().catch((err) => {
  console.error(
    'An error occurred while attempting to apply migrations to the database:',
    err,
  );
});
