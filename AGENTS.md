# AGENTS.md - Spare Tokens

This repository builds a public-good task catalog and CLI. Agents working here should preserve the core constraint: make AI attempts useful without creating maintainer burden.

## Rules

1. Do not add model calls, browser automation against consumer AI products, or subscription-token routing without explicit design review.
2. Default task outputs must be artifacts: diffs, repros, test reports, issue drafts, benchmarks, accessibility reports, or documentation patches.
3. Do not make PR creation the default path. Use `do-not-open-pr` unless a task has maintainer permission or explicit human-review gates.
4. Every task needs an impact claim, tractability claim, verification steps, risk notes, and expected outputs.
5. Keep task context small. If an AI needs a whole repo to understand the task, the task is probably not v0-ready.
6. Do not include secrets, private data, credentials, or instructions requiring personal accounts.
7. For health, civic, legal, finance, or other high-stakes domains, require human supervision and frame outputs as informational artifacts, not decisions.

## Validation

Run:

```bash
npm run validate
npm run build
npm test
```

Generated `public/index.html` is ignored locally; regenerate with:

```bash
npm run catalog
```

