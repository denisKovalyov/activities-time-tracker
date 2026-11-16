# activities-time-tracker

Web application to track time spent on various activities

## Tests

```sh
npm test                         # unit tests, no database needed
npm run test:integration:docker  # integration tests in Docker
```

### Integration tests

They test the data layer (`src/lib/db`) against a real Postgres. The tests
drop and recreate all tables, so they refuse to run against anything but a
database on `localhost`.

`npm run test:integration:docker` needs a running Docker. It starts Postgres 16
in a container on port 54329, runs the tests and removes the container, also
when the tests fail.

To run the tests several times against the same container:

```sh
npm run db:test:start      # start Postgres
npm run test:integration   # run as often as needed
npm run db:test:stop       # stop and remove the container
```

To use another local database, set `TEST_DATABASE_URL` (by default
`postgres://postgres@localhost:54329/postgres`).

In CI the tests run against a Postgres service container.
