# Context

This task investigates a narrow database migration behavior:

```sql
ALTER TABLE items ADD COLUMN IF NOT EXISTS flag BOOLEAN DEFAULT false;
```

The expected semantics for an already-existing column are "no schema change." If existing row values are rewritten by a no-op migration, the behavior can cause silent data loss in applications that run idempotent migrations.

The goal is not to prove blame. The goal is to produce a minimal, current-version reproduction or falsification that a DuckDB maintainer can verify quickly.

Keep the repro small and avoid application-specific code.

