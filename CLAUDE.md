# CLAUDE.md

## Workflow

- Features, refactoring, fixes and any other non-trivial changes are done in a separate branch (`feat/…`, `refactor/…`, `fix/…`, `chore/…`), never committed directly to `main`. Changes reach `main` via a pull request.
- Before committing, make sure `npm run lint`, `npm run prettier:check`, `npm run typecheck` and `npm test` pass — the same checks run in CI (`.github/workflows/ci.yml`).
- The pre-commit hook only checks staged files (eslint, prettier --check) and never modifies them; fix reported issues manually (e.g. `npm run prettier`) and commit again.
