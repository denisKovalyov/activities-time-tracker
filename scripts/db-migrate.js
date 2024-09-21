const { db: dbReset } = require('@vercel/postgres');

async function addOrderColumnToActivities(client) {
  try {
    await client.sql`ALTER TABLE activity ADD COLUMN "order" INTEGER NOT NULL`;
    console.log(`Added "order" column to the "activity" table`);
  } catch (error) {
    console.error('Error on adding "order" column to the "activity" table:', error);
    throw error;
  }
}

async function main() {
  const client = await dbReset.connect();
  await addOrderColumnToActivities(client);
  await client.end();
}

main().catch((err) => {
  console.error(
    'An error occurred while attempting to apply migrations to the database:',
    err,
  );
});
