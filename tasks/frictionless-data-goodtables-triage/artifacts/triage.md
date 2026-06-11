# Frictionless Data Goodtables-Related Issue Triage

Checked on 2026-06-11.

Search used:

```text
https://github.com/frictionlessdata/frictionless-py/issues?q=is%3Aissue+goodtables
```

Local package version available for any follow-up reproduction:

```powershell
python -m frictionless --version
# 5.19.0
```

No issue below is classified as `still reproducible`; the open items are design/performance/feature requests rather than self-contained validation bugs, and the concrete validation bug examples checked are already closed.

## Triage Table

| Issue | Current status | Classification | Evidence |
| --- | --- | --- | --- |
| https://github.com/frictionlessdata/frictionless-py/issues/1331 | Open | Needs maintainer clarification | The issue asks whether `Report` metadata inherited from Goodtables should be restructured to avoid duplicated descriptions/messages; it is a design/performance question, has no assignee, and has no linked development work. |
| https://github.com/frictionlessdata/frictionless-py/issues/568 | Open | Needs maintainer clarification | The issue is an umbrella performance task from the Goodtables migration era, listing benchmark creation, `read_rows` speed, date/time parsing, and large Excel validation performance; it is too broad for one reproducible command. |
| https://github.com/frictionlessdata/frictionless-py/issues/544 | Open | Needs maintainer clarification | The issue requests i18n for error template messages while migrating a French-audience Goodtables-based project; it needs an accepted i18n design/library before implementation. |
| https://github.com/frictionlessdata/frictionless-py/issues/551 | Closed, project status Done | Already fixed/closed | The issue contains a concrete custom `Check.validate_header` repro from a Goodtables migration, but GitHub shows it closed with linked PR/issue `#572` and project status `Done`. |
| https://github.com/frictionlessdata/frictionless-py/issues/614 | Closed, project status Done | Already fixed/closed | The issue reports conflicting Goodtables vs Frictionless validation results for `datapackage.json`, but GitHub shows it closed and project status `Done`. |
| https://github.com/frictionlessdata/frictionless-py/issues/651 | Closed, project status Done | Already fixed/closed | The issue reports migration-guide gaps from Goodtables to Frictionless, and GitHub shows it closed with linked `#713` and project status `Done`. |
| https://github.com/frictionlessdata/frictionless-py/issues/1429 | Closed, project status Done | Already fixed/closed | The issue asks broader questions about migrating from pre-v4 tooling, explicitly mentioning Goodtables to `frictionless validate`, and GitHub shows it closed with project status `Done`. |

## Suggested Draft Comments

These are drafts only; do not post automatically.

### #1331

This looks like it may still be useful, but it reads more like an architectural design decision than a standalone bug. Would it help if someone drafted a short before/after shape for the `Report` payload and a small fixture showing the duplicated fields that would be removed?

### #568

This still seems directionally useful, but it might be easier to act on if split into smaller benchmark tasks. A minimal first step could be a reproducible benchmark fixture for one path, such as CSV validation with numeric/date fields, before tackling `read_rows`, Excel, and parsing changes together.

### #544

This request still looks relevant for downstream users that need localized validation output. The main blocker appears to be choosing the intended i18n approach. Would a short design sketch comparing a lightweight message-catalog approach with subclassing/overrides be a useful next contribution?

## Notes For A Maintainer

- I did not post comments.
- I did not classify any open issue as `still reproducible`, because none of the selected open issues has a narrow current-version command to run.
- If maintainers want code help, the most AI-friendly next task is probably #568 split into a benchmark fixture, because performance improvements need a stable measurement target before implementation.
