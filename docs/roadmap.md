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

## v1

The v1 bar is external contributor readiness:

- A new contributor can choose a task, run an agent, produce artifacts, update lifecycle metadata, and submit a reviewable PR without direct guidance from the project owner.
- At least one task has been completed by someone outside the initial author workflow.
- The catalog distinguishes open work from completed, blocked, and upstream-published work.
- The public npm package has been published and tested from a clean machine or throwaway directory.
