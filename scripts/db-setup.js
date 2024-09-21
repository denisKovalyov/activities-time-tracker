const { db: dbReset } = require('@vercel/postgres');

async function setupUser(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await client.sql`
      CREATE TABLE IF NOT EXISTS "user" (
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

    console.log(`Created "user" table`);
  } catch (error) {
    console.error('Error on creating "user" table:', error);
    throw error;
  }
}

async function setupActivity(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await client.sql`
      CREATE TABLE IF NOT EXISTS activity (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id UUID,
        name VARCHAR(255) NOT NULL UNIQUE,
        color CHAR(6) NOT NULL,
        icon VARCHAR(20) NOT NULL,
        is_archived BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
        CONSTRAINT fk_user_id FOREIGN KEY(user_id) REFERENCES "user"(id)
      );
    `;

    console.log(`Created "activity" table`);
  } catch (error) {
    console.error('Error on creating "activity" table:', error);
    throw error;
  }
}

async function setupRecord(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await client.sql`
      CREATE TABLE IF NOT EXISTS record (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id UUID,
        date TIMESTAMP WITH TIME ZONE NOT NULL,
        activities JSONB NOT NULL,
        CONSTRAINT fk_user_id FOREIGN KEY(user_id) REFERENCES "user"(id)
      );
    `;

    console.log(`Created "record" table`);
  } catch (error) {
    console.error('Error on creating "record" table:', error);
    throw error;
  }
}

async function main() {
  const client = await dbReset.connect();
  await setupUser(client);
  await setupActivity(client);
  await setupRecord(client);
  await client.end();
}

main().catch((err) => {
  console.error(
    'An error occurred while attempting to setup the database:',
    err,
  );
});
