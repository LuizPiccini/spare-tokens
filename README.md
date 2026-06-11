# Spare Tokens

AI-ready public-good tasks for spare model quota.

Spare Tokens is an explicitly effective-altruist / rationalist project: convert surplus AI usage into small artifacts that matter, are tractable for AI, and are cheap for humans to verify.

The core bet is not that AI can solve everything. The bet is narrower:

> There are many public-good tasks where a well-scoped AI attempt plus a clear verification packet has positive expected value.

## v0.7 Scope

v0.7 adds the first Codex-style agent workflow. A user can ask an agent to run Spare Tokens, review five maintainer-signaled issues, pick one, and let the agent work toward a tested PR draft:

- A machine-readable task packet format.
- A TypeScript CLI to validate, rank, pick, and export task packets.
- Prompt export for Codex, Claude, and Gemini-style agents.
- A generated static catalog page.
- A GitHub Action that validates tasks.
- Lifecycle states for open, artifact-ready, PR-ready, published, blocked, and done tasks.
- Artifact references for repros, reports, issue drafts, patches, and upstream status notes.
- Contributor docs, a task proposal template, and a review rubric.
- A `pick` command that ranks open tasks and exports a selected prompt by rank or task id.
- A curated `sources.yaml` registry of science, civic-tech, and health OSS repositories.
- An `ingest github` command that imports maintainer-labeled issues as normal task packets.
- A `start` command that imports, ranks, and prints the next selection command for agents.
- Generated GitHub prompts that ask agents to re-check the issue, clone the repo, make a narrow change, run tests, run adversarial review, and prepare a PR draft.

Spare Tokens does not call any model, automate consumer subscriptions, or route requests through user accounts. It lets agents prepare PRs, but upstream posting requires human approval unless the user explicitly approved PR submission for the selected task.

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
npx spare-tokens@latest start --target codex
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
spare start --target codex
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
npx tsx src/cli.ts start --target codex --no-import
npx tsx src/cli.ts pick tasks --target codex
npx tsx src/cli.ts pick tasks --target codex --select 1
npx tsx src/cli.ts list tasks
npx tsx src/cli.ts export tasks/duckdb-alter-default-regression --target codex
```

Import fresh maintainer-labeled GitHub issues:

```bash
npx tsx src/cli.ts sources
npx tsx src/cli.ts ingest github --source openrefine-good-first-issue --limit 3 --out tasks
npx tsx src/cli.ts ingest github --repo scikit-learn/scikit-learn --labels "help wanted" --cause science --limit 3 --out tasks
npx tsx src/cli.ts pick tasks --target codex
```

After build:

```bash
node dist/cli.js validate tasks
node dist/cli.js start --target codex --no-import
node dist/cli.js pick tasks --target codex
node dist/cli.js sources
node dist/cli.js ingest github --source scipy-good-first-issue --limit 2 --out tasks
node dist/cli.js catalog --out public/index.html
```

## Agent Journey

Tell your agent:

```text
Please run Spare Tokens.
```

The agent should run:

```bash
npx spare-tokens@latest start --target codex
```

It should show the top five tasks, ask which one you want, export the selected prompt, then execute the prompt end to end: re-check the issue, clone or open the upstream repo, make the smallest useful change, run tests, run adversarial review, prepare a PR title/body, and ask before opening the PR unless you already approved PR submission for that selected task.

For machine-readable agent flows:

```bash
npx spare-tokens@latest start --target codex --json
npx spare-tokens@latest pick --target codex --json
npx spare-tokens@latest pick --target codex --select 1 --json
```

For fresh GitHub issue sourcing:

```bash
npx spare-tokens@latest sources
npx spare-tokens@latest ingest github --source all --limit 1 --out spare-tokens-tasks
npx spare-tokens@latest pick spare-tokens-tasks --target codex
```

The GitHub importer uses public issue search. Set `GITHUB_TOKEN` if GitHub rate-limits unauthenticated requests.

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
- `pr-ready`: a tested branch or patch and PR draft are ready for human approval.
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
