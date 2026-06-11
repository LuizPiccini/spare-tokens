# Agent Usage

Spare Tokens is meant to be called by an AI agent inside a CLI or desktop app.

## Default Flow

Ask the agent:

```text
Please run Spare Tokens.
```

The agent should run:

```bash
npx spare-tokens@latest start --target codex
```

Use `--target claude` or `--target gemini` for those prompt variants.

The agent must show the top five tasks, ask which one the user wants, export the selected prompt, and then execute the selected prompt end to end.

The expected execution flow is:

- re-check the upstream issue
- clone or open the upstream repository
- create a narrow local branch
- make the smallest useful change
- run targeted tests, docs builds, examples, or linters
- run the adversarial review checklist
- prepare a PR title and body
- ask before pushing or opening the PR unless the user already approved PR submission for that selected task

## Fresh GitHub Issue Flow

`start` combines import and ranking:

```bash
npx spare-tokens@latest start --target codex
```

For fewer GitHub API calls, import one curated source:

```bash
npx spare-tokens@latest sources
npx spare-tokens@latest start --target codex --source openrefine-good-first-issue
npx spare-tokens@latest ingest github --source openrefine-good-first-issue --limit 3 --out spare-tokens-tasks
npx spare-tokens@latest pick spare-tokens-tasks --target codex
```

For an ad hoc important repository:

```bash
npx spare-tokens@latest ingest github --repo scikit-learn/scikit-learn --labels "help wanted" --cause science --limit 3 --out spare-tokens-tasks
npx spare-tokens@latest pick spare-tokens-tasks --target codex
```

The importer reads public GitHub issues only. Set `GITHUB_TOKEN` when GitHub rate-limits unauthenticated search.

## Commands

Start the agent workflow:

```bash
npx spare-tokens@latest start --target codex
npx spare-tokens@latest start --target codex --json
```

Show the top five open tasks:

```bash
npx spare-tokens@latest pick --target codex
```

Export the selected task prompt:

```bash
npx spare-tokens@latest pick --target codex --select 1
npx spare-tokens@latest pick --target codex --select python-docs-heading-order-audit
```

Machine-readable mode:

```bash
npx spare-tokens@latest pick --target codex --json
npx spare-tokens@latest pick --target codex --select 1 --json
```

Optional filters:

```bash
npx spare-tokens@latest pick --target codex --cause health
npx spare-tokens@latest pick --target codex --max-risk low
```

## Agent Rules

- Show the top tasks to the user before exporting a selected prompt.
- Do not choose a task silently unless the user has already delegated that choice.
- Treat the exported prompt as the task instructions.
- For GitHub issue tasks, work toward a narrow tested change when tractable.
- Run adversarial review before proposing upstream action.
- Prepare PR title/body when the work is PR-shaped.
- Do not open PRs or post upstream unless the task explicitly allows it and the user approves the specific upstream action.
- Do not use private data, credentials, logged-in personal accounts, or consumer AI subscription automation.
