# Upstream Status

Status checked on 2026-06-11.

## Public Upstream

- Issue: https://github.com/duckdb/duckdb/issues/23209
- Local implementation branch: `C:\Users\LuizPiccini\Documents\PicciniDigitalBrain\temp\duckdb-upstream`, branch `codex/fix-add-column-if-not-exists-default`
- Local implementation commit: `cc50944b956804ca6752232aa2e8ed03fa454491`
- Portable patch: `C:\Users\LuizPiccini\Documents\PicciniDigitalBrain\temp\duckdb-repro\duckdb-if-not-exists-default.patch`

## What Was Implemented

The local DuckDB patch fixes the materialized-default rewrite path for:

```sql
ALTER TABLE ... ADD COLUMN IF NOT EXISTS ... DEFAULT ...
```

The generated `UPDATE` / `ALTER SET DEFAULT` tail is now skipped when the target column already exists under `IF NOT EXISTS`, while the existing materialization flow remains in place when the column is absent.

## Verification

From `temp\duckdb-repro\VERIFICATION.md`:

```text
git diff --check
make debug DISABLE_SHELL=1 BUILD_EXTENSIONS=
build/debug/test/run test/sql/alter/test_alter_if_exists.test
```

The targeted SQL test passed on Ubuntu 24.04 x86_64:

```text
ran tests: 1 passed, 0 skipped in 6s
```

## Publishing Blocker

Direct push to `duckdb/duckdb` failed with `403`, and no `LuizPiccini/duckdb` fork exists at `https://github.com/LuizPiccini/duckdb.git`. The GitHub connector also returned `403 Resource not accessible by integration` when trying to comment on the issue.
