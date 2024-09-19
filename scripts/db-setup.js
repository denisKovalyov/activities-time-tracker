const { db: dbReset } = require('@vercel/postgres');

async function setupUsers(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await client.sql`
      CREATE TABLE IF NOT EXISTS users (
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

async function setupActivities(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await client.sql`
      CREATE TABLE IF NOT EXISTS activities (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id UUID,
        name VARCHAR(255) NOT NULL UNIQUE,
        color CHAR(6) NOT NULL,
        icon VARCHAR(20) NOT NULL,
        is_archived BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
        CONSTRAINT fk_user_id FOREIGN KEY(user_id) REFERENCES users(id)
      );
    `;

    console.log(`Created "activities" table`);
  } catch (error) {
    console.error('Error on creating "activities" table:', error);
    throw error;
  }
}

async function setupRecords(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await client.sql`
      CREATE TABLE IF NOT EXISTS records (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id UUID,
        date TIMESTAMP WITH TIME ZONE NOT NULL,
        activities JSONB NOT NULL,
        CONSTRAINT fk_user_id FOREIGN KEY(user_id) REFERENCES users(id)
      );
    `;

    console.log(`Created "records" table`);
  } catch (error) {
    console.error('Error on creating "records" table:', error);
    throw error;
  }
}

async function main() {
  const client = await dbReset.connect();
  await setupUsers(client);
  await setupActivities(client);
  await setupRecords(client);
  await client.end();
}

main().catch((err) => {
  console.error(
    'An error occurred while attempting to setup the database:',
    err,
  );
});
