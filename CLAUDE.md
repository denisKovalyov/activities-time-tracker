# CLAUDE.md

## Workflow

- Features, refactoring, fixes and any other non-trivial changes are done in a separate branch (`feat/…`, `refactor/…`, `fix/…`, `chore/…`), never committed directly to `main`.
- Never bypass the pre-commit hook (`--no-verify`) and don't auto-fix files in it; fix reported issues manually and commit again.
