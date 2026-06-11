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

print(
    json.dumps(
        {
            "duckdb_version": duckdb.__version__,
            "before": before,
            "after": after,
            "unchanged": before == after,
        },
        indent=2,
    ),
)
