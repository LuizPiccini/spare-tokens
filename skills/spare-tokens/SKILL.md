---
name: spare-tokens
description: Use Spare Tokens to find AI-ready public-good tasks when a user wants to spend spare model quota on useful work.
---

# Spare Tokens

Use this skill when the user wants to spend spare AI quota on public-good work, asks for "spare tokens", or wants an AI to pick tractable open tasks.

## Workflow

1. Run the picker for the active agent target:

```bash
npx spare-tokens@latest pick --target codex
```

Use `--target claude` or `--target gemini` when appropriate.

2. Show the user the top five open tasks. Preserve the rank number, task id, cause area, risk, estimated agent time, human review time, and score rationale.

3. Ask the user which task they want to tackle.

4. Export the selected prompt:

```bash
npx spare-tokens@latest pick --target codex --select <rank-or-task-id>
```

5. Follow the exported prompt. Produce a reviewable artifact first.

## Safety

- Do not post upstream, open a PR, or contact maintainers unless the task explicitly permits it or the user approves the specific action.
- Do not use private data, credentials, logged-in personal accounts, or consumer AI subscription automation.
- For health, civic, legal, finance, elections, or welfare tasks, frame outputs as informational artifacts for human review.

## Machine-Readable Mode

Agents may use JSON for routing:

```bash
npx spare-tokens@latest pick --target codex --json
npx spare-tokens@latest pick --target codex --select 1 --json
```
