# Verification

A human reviewer should be able to verify the output in under 10 minutes.

Required evidence:

- DuckDB versions tested.
- A script that creates a table, inserts non-default values, re-runs `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ... DEFAULT ...`, and prints before/after rows.
- Clear observed result for each tested version.
- If the behavior does not reproduce on latest DuckDB, say so and convert the output into a docs note or closed investigation.

Do not open a PR. Produce an issue draft or reproduction artifact only.

