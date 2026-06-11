# Contributing

Spare Tokens turns spare AI-agent time into public-good artifacts that humans can review quickly. Contributions should improve the task catalog, complete a task packet, or improve the tooling that makes those two workflows safer.

## Pick A Task

1. Open the catalog or run `npx tsx src/cli.ts list tasks`.
2. Prefer tasks with lifecycle state `open`.
3. Read `task.yaml`, `context.md`, and `verify.md`.
4. Export the prompt for your agent:

```bash
npx tsx src/cli.ts export tasks/<task-id> --target codex
npx tsx src/cli.ts export tasks/<task-id> --target claude
npx tsx src/cli.ts export tasks/<task-id> --target gemini
```

## Complete A Task

Create artifacts under:

```text
tasks/<task-id>/artifacts/
```

Good artifacts include:

- minimal repro scripts
- short reports
- triage tables
- benchmark outputs
- issue or PR drafts
- upstream status notes

Do not post upstream comments or PRs unless the task explicitly permits it or a human reviewer approves it. When in doubt, produce a local artifact first.

## Update Lifecycle

After producing artifacts, update `task.yaml`:

```yaml
lifecycle:
  state: artifact-ready
  last_updated: "YYYY-MM-DD"
  notes: Short factual status note.
  upstream: []
artifacts:
  - label: Reproduction report
    path: artifacts/report.md
    type: report
    description: What a reviewer can verify in this artifact.
```

Use `published-upstream` only when a public upstream issue, PR, discussion, or comment exists. Use `blocked` only when the next useful action requires maintainer input, credentials, or a permission the contributor does not have.

## Add A New Task

Use `.github/ISSUE_TEMPLATE/task-packet.yml` or copy an existing packet. A good task has:

- public-good upside
- a bounded AI-tractable action
- a concrete output
- verification evidence a human can review in 10 to 15 minutes
- no secrets, private data, or personal-account dependency
- conservative handling of health, civic, legal, finance, and welfare topics

## Validate

Run:

```bash
npm run validate
npm run build
npm test
npm run catalog
```

The validator checks packet structure, referenced prompt/context files, and referenced local artifact files.
