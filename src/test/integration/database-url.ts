export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  'postgres://postgres@localhost:54329/postgres';

// The tests drop and recreate all tables, so they must never run against a
// real database by mistake.
export const assertLocalDatabase = () => {
  const { hostname, searchParams } = new URL(TEST_DATABASE_URL);
  // pg lets ?host= and ?hostaddr= override the host of the URL
  const overridesHost =
    searchParams.has('host') || searchParams.has('hostaddr');
  if (overridesHost || !['localhost', '127.0.0.1'].includes(hostname)) {
    throw new Error(
      `Integration tests run only against a local database, got "${hostname}".`,
    );
  }
};
