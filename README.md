# activities-time-tracker

Web application to track time spent on various activities

## Tests

- `npm test`: unit tests, no database needed.
- `npm run test:integration`: tests of the data layer (`src/lib/db`) against a
  real Postgres. They drop and recreate all tables, so they run only against a
  local database (`TEST_DATABASE_URL`, by default
  `postgres://postgres@localhost:54329/postgres`).

  ```sh
  npm run db:test:start   # Postgres 16 in Docker on port 54329
  npm run test:integration
  npm run db:test:stop
  ```

  In CI the same tests run against a Postgres service container.
