# Spare Tokens

AI-ready public-good tasks for spare model quota.

Spare Tokens is an explicitly effective-altruist / rationalist project: convert surplus AI usage into small artifacts that matter, are tractable for AI, and are cheap for humans to verify.

The core bet is not that AI can solve everything. The bet is narrower:

> There are many public-good tasks where a well-scoped AI attempt plus a clear verification packet has positive expected value.

## V0 Scope

V0 is intentionally boring:

- A machine-readable task packet format.
- A TypeScript CLI to validate task packets.
- Prompt export for Codex, Claude, and Gemini-style agents.
- A generated static catalog page.
- A GitHub Action that validates tasks.

V0 does not call any model, automate consumer subscriptions, open PRs, or route requests through user accounts.

## Why This Exists

Existing issue lists optimize for human discovery. Spare Tokens optimizes for AI operability and human review:

- Is the task important enough to be worth doing?
- Is it tractable for an AI coding/research agent?
- Is the expected output concrete?
- Can a human verify it in under 10 minutes?
- Is the default action an artifact, not maintainer spam?

## Seed Task Criteria

The initial catalog is deliberately small. A task belongs in v0 when it satisfies all of these:

- **Public-good upside:** useful to civic, science, health, or open-source infrastructure users.
- **AI-tractable surface:** research, repros, docs, accessibility, data quality, or triage work with clear boundaries.
- **Cheap human verification:** the required evidence can be reviewed by a human in roughly 10 to 15 minutes.
- **Low maintainer burden:** the default output is a reviewable artifact, draft, or report rather than unsolicited automated PR spam.
- **Low credential risk:** no private data, secrets, logged-in accounts, or attempts to automate consumer AI subscriptions.

## Install

```bash
npm install
npm run build
```

Run locally during development:

```bash
npm run validate
npm run catalog
npx tsx src/cli.ts list tasks
npx tsx src/cli.ts export tasks/duckdb-alter-default-regression --target codex
```

After build:

```bash
node dist/cli.js validate tasks
node dist/cli.js catalog --out public/index.html
```

## Task Packet

Each task lives in `tasks/<task-id>/`:

```text
tasks/<task-id>/
  task.yaml
  context.md
  verify.md
  prompts/
    codex.md
    claude.md
    gemini.md
```

The YAML is the source of truth. Markdown files carry context, target-specific prompts, and verification instructions.

## Safety Rules

- Default output is a reviewable artifact, not a PR.
- PRs are allowed only when `pr_policy` explicitly permits them.
- No task should require secrets, private data, credentials, or logged-in personal accounts.
- No task should ask users to bypass model provider limits or automate consumer web UIs.
- High-stakes domains such as health, law, finance, elections, and social welfare require human-supervised verification and conservative task design.

## License

Code is MIT licensed. Task content and docs are CC BY 4.0 unless a task packet says otherwise.
