# Agent Usage

Spare Tokens is meant to be called by an AI agent inside a CLI or desktop app.

## Default Flow

Ask the agent:

```text
Use Spare Tokens. Run `npx spare-tokens@latest pick --target codex`, show me the top five open tasks, ask which one I want, then run the same command with `--select <rank-or-task-id>` and work from the exported prompt.
```

Use `--target claude` or `--target gemini` for those prompt variants.

## Commands

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
- Produce a reviewable artifact first.
- Do not open PRs or post upstream unless the task explicitly allows it or the user approves the specific upstream action.
- Do not use private data, credentials, logged-in personal accounts, or consumer AI subscription automation.
