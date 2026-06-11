# DuckDB `ADD COLUMN IF NOT EXISTS` Default Rewrite Repro

Checked on 2026-06-11 with the Python package from PyPI. `pip index versions duckdb` reported `1.5.3` as the latest release.

## Reproduction

Run:

```powershell
python tasks\duckdb-alter-default-regression\artifacts\repro.py
```

The script is 24 lines. It creates `items(id)`, inserts three rows, adds `flag BOOLEAN DEFAULT false`, updates two rows to `true`, then reruns:

```sql
ALTER TABLE items ADD COLUMN IF NOT EXISTS flag BOOLEAN DEFAULT false;
```

It prints `before`, `after`, and whether the rows were unchanged.

## Observed Results

| DuckDB Python package | Result |
| --- | --- |
| `1.3.2` | Values unchanged: `[(1, true), (2, false), (3, true)]` before and after. |
| `1.4.4` | Values unchanged: `[(1, true), (2, false), (3, true)]` before and after. |
| `1.5.2` | Existing values rewritten to the default: after rows are `[(1, false), (2, false), (3, false)]`. |
| `1.5.3` | Existing values rewritten to the default: after rows are `[(1, false), (2, false), (3, false)]`. |

The behavior reproduces on the latest available PyPI package, `1.5.3`.

## Issue Draft

Title:

`ALTER TABLE ... ADD COLUMN IF NOT EXISTS` rewrites existing values to default when column already exists

Body:

I found a regression in the Python package where an idempotent `ADD COLUMN IF NOT EXISTS` statement appears to rewrite existing column values to the declared default when the column already exists.

Minimal script:

```python
import json

import duckdb

con = duckdb.connect(":memory:")
con.execute("CREATE TABLE items (id INTEGER PRIMARY KEY)")
con.execute("INSERT INTO items VALUES (1), (2), (3)")
con.execute("ALTER TABLE items ADD COLUMN flag BOOLEAN DEFAULT false")
con.execute("UPDATE items SET flag = true WHERE id IN (1, 3)")
before = con.execute("SELECT id, flag FROM items ORDER BY id").fetchall()
con.execute("ALTER TABLE items ADD COLUMN IF NOT EXISTS flag BOOLEAN DEFAULT false")
after = con.execute("SELECT id, flag FROM items ORDER BY id").fetchall()

print(json.dumps({"duckdb_version": duckdb.__version__, "before": before, "after": after, "unchanged": before == after}, indent=2))
```

Observed:

- `1.3.2` and `1.4.4`: rows are unchanged.
- `1.5.2` and `1.5.3`: rows with `flag = true` are rewritten to `false`.

Expected behavior: because the column already exists, `ADD COLUMN IF NOT EXISTS` should be a no-op and should not rewrite existing values.

Impact: applications that run idempotent migrations can silently lose data when replaying a migration that includes a defaulted column.
