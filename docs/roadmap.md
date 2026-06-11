# Roadmap

## v0.1

- Machine-readable task packets.
- CLI validation and prompt export.
- Static catalog generation.
- Four seed tasks.

## v0.2

- Lifecycle state for each task.
- Artifact references in packet metadata.
- Catalog visibility for artifacts and upstream status.

## v0.3

- Contributor workflow.
- Task submission template.
- Review rubric.

## v0.4

- At least 14 seed tasks across OSS infrastructure, civic tech, science, health, climate, and education.
- Completed-task artifacts from the first execution pass are tracked by packet metadata.
- Catalog shows status, artifacts, upstream state, and prompt export commands.

## v0.5

The v0.5 bar is agent-picker readiness:

- `npx spare-tokens@latest pick --target <codex|claude|gemini>` ranks the top open tasks.
- A user can select by rank or task id and receive the selected prompt.
- The picker has JSON output for desktop agents and CLI wrappers.
- The package manifest includes built CLI entry points and packaged task/catalog docs.
- An agent skill wrapper explains the intended user journey.

## v0.6

The v0.6 bar is relevant-source ingestion:

- A curated `sources.yaml` registry points at high-value science, civic-tech, and health OSS repositories.
- `spare sources` lists the current GitHub source registry.
- `spare ingest github` imports maintainer-labeled public GitHub issues as normal task packets.
- Imported issue packets preserve the artifact-first rule: no comments, PRs, or maintainer contact without human approval.
- The picker gives imported GitHub issues a score boost because maintainers already signaled demand.

## v0.7

The v0.7 bar is agent-workflow readiness:

- `spare start --target <codex|claude|gemini>` imports a small fresh issue set, ranks it, and prints the next selection command.
- Generated GitHub issue prompts guide agents through issue re-check, repo setup, narrow implementation, tests, adversarial review, and PR draft preparation.
- Imported GitHub issue packets default to `allowed-after-human-review` because maintainer labels signal openness to contribution, but not permission for unattended PR spam.
- The task lifecycle includes `pr-ready` for a tested branch or patch with a PR draft awaiting human approval.
- The Spare Tokens skill maps the plain request "Please run Spare Tokens" to the full human-in-the-loop workflow.

## v1

The v1 bar is external contributor readiness:

- A new contributor can choose a task, run an agent, produce artifacts, update lifecycle metadata, and submit a reviewable PR without direct guidance from the project owner.
- At least one task has been completed by someone outside the initial author workflow.
- The catalog distinguishes open work from completed, blocked, and upstream-published work.
- The public npm package has been published and tested from a clean machine or throwaway directory.
