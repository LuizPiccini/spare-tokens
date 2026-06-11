# Spare Tokens

AI-ready public-good tasks for spare model quota.

Spare Tokens is an explicitly effective-altruist / rationalist project: convert surplus AI usage into small artifacts that matter, are tractable for AI, and are cheap for humans to verify.

The core bet is not that AI can solve everything. The bet is narrower:

> There are many public-good tasks where a well-scoped AI attempt plus a clear verification packet has positive expected value.

## v0.5 Scope

v0.5 is the first agent-picker milestone. A user can tell an AI agent to run one command, review the top open tasks, choose one, and receive the task prompt:

- A machine-readable task packet format.
- A TypeScript CLI to validate, rank, pick, and export task packets.
- Prompt export for Codex, Claude, and Gemini-style agents.
- A generated static catalog page.
- A GitHub Action that validates tasks.
- Lifecycle states for open, artifact-ready, published, blocked, and done tasks.
- Artifact references for repros, reports, issue drafts, patches, and upstream status notes.
- Contributor docs, a task proposal template, and a review rubric.
- A `pick` command that ranks open tasks and exports a selected prompt by rank or task id.

Spare Tokens does not call any model, automate consumer subscriptions, open PRs by default, or route requests through user accounts.

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

Use the public command path:

```bash
npx spare-tokens@latest pick --target codex
npx spare-tokens@latest pick --target codex --select 1
```

The same command supports Claude and Gemini prompt variants:

```bash
npx spare-tokens@latest pick --target claude
npx spare-tokens@latest pick --target gemini --select python-docs-heading-order-audit
```

For global install after the package is published:

```bash
npm install -g spare-tokens
spare pick --target codex
spare pick --target codex --select 1
```

Run locally during development:

```bash
npm install
npm run build
```

```bash
npm run validate
npm run catalog
npx tsx src/cli.ts pick tasks --target codex
npx tsx src/cli.ts pick tasks --target codex --select 1
npx tsx src/cli.ts list tasks
npx tsx src/cli.ts export tasks/duckdb-alter-default-regression --target codex
```

After build:

```bash
node dist/cli.js validate tasks
node dist/cli.js pick tasks --target codex
node dist/cli.js catalog --out public/index.html
```

## Agent Journey

Tell your agent:

```text
Use Spare Tokens. Run `npx spare-tokens@latest pick --target codex`, show me the top five open tasks, ask which one I want, then run the same command with `--select <rank-or-task-id>` and work from the exported prompt.
```

For machine-readable agent flows:

```bash
npx spare-tokens@latest pick --target codex --json
npx spare-tokens@latest pick --target codex --select 1 --json
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
  artifacts/
    ...
```

The YAML is the source of truth. Markdown files carry context, target-specific prompts, verification instructions, and optional artifacts. Local artifact paths listed in `task.yaml` are validated.

## Lifecycle

Tasks use these states:

- `open`: ready for someone to attempt.
- `artifact-ready`: a local artifact exists and is ready for review.
- `published-upstream`: an upstream issue, PR, discussion, or comment exists.
- `blocked`: useful next action needs permission, credentials, or maintainer input.
- `done`: a human-verifiable terminal state has been reached.

See [CONTRIBUTING.md](CONTRIBUTING.md), [docs/review-rubric.md](docs/review-rubric.md), and [docs/roadmap.md](docs/roadmap.md).

## Safety Rules

- Default output is a reviewable artifact, not a PR.
- PRs are allowed only when `pr_policy` explicitly permits them.
- No task should require secrets, private data, credentials, or logged-in personal accounts.
- No task should ask users to bypass model provider limits or automate consumer web UIs.
- High-stakes domains such as health, law, finance, elections, and social welfare require human-supervised verification and conservative task design.

## License

Code is MIT licensed. Task content and docs are CC BY 4.0 unless a task packet says otherwise.
