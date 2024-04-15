const { db: dbReset } = require('@vercel/postgres');

async function resetDB(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await client.sql`
      CREATE TABLE users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email_verification_token TEXT,
        email_verified TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL
      );
    `;

    console.log(`Created "users" table`);
  } catch (error) {
    console.error('Error on creating "users" table:', error);
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
    'An error occurred while attempting to setup the database:',
    err,
  );
});
