const { db: dbReset } = require('@vercel/postgres');

async function setupUser(client) {
  try {
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
    // position is a fractional index (see the fractional-indexing package):
    // sorting by it gives the order in the UI, and moving an activity
    // updates only that one row. COLLATE "C" makes the sort byte-wise,
    // which is what fractional indexing keys rely on.
    await client.sql`
      CREATE TABLE IF NOT EXISTS activity (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        color CHAR(6) NOT NULL,
        icon VARCHAR(100) NOT NULL,
        position TEXT COLLATE "C" NOT NULL,
        is_archived BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT unique_activity_constraint UNIQUE(user_id, name, color, icon),
        -- Target for the time_entry foreign key below
        CONSTRAINT unique_activity_user UNIQUE(id, user_id)
      );
    `;
    await client.sql`
      CREATE INDEX IF NOT EXISTS activity_user_position_idx
      ON activity(user_id, position)
    `;

    console.log(`Created "activity" table`);
  } catch (error) {
    console.error('Error on creating "activity" table:', error);
    throw error;
  }
}

async function setupTimeEntry(client) {
  try {
    // One row per timer run. A running timer has ended_at = NULL.
    // Time spent per day/week/month is calculated from these intervals
    // when reading, so midnight needs no special handling when writing.
    await client.sql`
      CREATE TABLE IF NOT EXISTS time_entry (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id UUID NOT NULL,
        activity_id UUID NOT NULL,
        started_at TIMESTAMP WITH TIME ZONE NOT NULL,
        ended_at TIMESTAMP WITH TIME ZONE,
        -- The activity must belong to the same user
        CONSTRAINT fk_activity_user FOREIGN KEY(activity_id, user_id)
          REFERENCES activity(id, user_id) ON DELETE CASCADE,
        CONSTRAINT ended_after_started CHECK (ended_at IS NULL OR ended_at >= started_at)
      );
    `;
    // A user can have only one running timer
    await client.sql`
      CREATE UNIQUE INDEX IF NOT EXISTS time_entry_one_running_per_user
      ON time_entry(user_id) WHERE ended_at IS NULL
    `;
    await client.sql`
      CREATE INDEX IF NOT EXISTS time_entry_user_started_idx
      ON time_entry(user_id, started_at)
    `;

    console.log(`Created "time_entry" table`);
  } catch (error) {
    console.error('Error on creating "time_entry" table:', error);
    throw error;
  }
}

async function main() {
  const client = await dbReset.connect();
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await setupUser(client);
  await setupActivity(client);
  await setupTimeEntry(client);
  await client.end();
}

main().catch((err) => {
  console.error(
    'An error occurred while attempting to setup the database:',
    err,
  );
});
