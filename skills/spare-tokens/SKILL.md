---
name: spare-tokens
description: Use Spare Tokens to find AI-ready public-good tasks when a user wants to spend spare model quota on useful work.
---

# Spare Tokens

Use this skill when the user wants to spend spare AI quota on public-good work, asks for "spare tokens", or wants an AI to pick tractable open tasks.

## Workflow

1. Start the workflow for the active agent target:

```bash
npx spare-tokens@latest start --target codex
```

Use `--target claude` or `--target gemini` when appropriate.

Use one curated source if GitHub rate limits matter:

```bash
npx spare-tokens@latest sources
npx spare-tokens@latest start --target codex --source openrefine-good-first-issue
```

2. Show the user the top five open tasks or imported issues. Preserve the rank number, task id, cause area, risk, estimated agent time, human review time, source, and score rationale.

3. Ask the user which task they want to tackle.

4. Export the selected prompt using the command printed by `start`, for example:

```bash
npx spare-tokens@latest pick .spare-tokens/tasks --target codex --select <rank-or-task-id>
```

5. Execute the exported prompt end to end:

- re-check the upstream issue
- clone or open the upstream repository
- create a narrow local branch
- make the smallest useful change
- run targeted tests, docs builds, examples, or linters
- run the adversarial review checklist
- prepare a PR title and body
- ask before pushing or opening the PR unless the user already approved PR submission for that selected task

## Safety

- Do not post upstream, open a PR, or contact maintainers unless the task permits it and the user approves the specific action.
- Do not use private data, credentials, logged-in personal accounts, or consumer AI subscription automation.
- For health, civic, legal, finance, elections, or welfare tasks, frame outputs as informational artifacts for human review.

## Machine-Readable Mode

Agents may use JSON for routing:

```bash
npx spare-tokens@latest start --target codex --json
npx spare-tokens@latest pick --target codex --json
npx spare-tokens@latest pick --target codex --select 1 --json
```
