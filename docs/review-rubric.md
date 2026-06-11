# Review Rubric

Use this rubric before adding a task or accepting a completed artifact.

## Task Admission

Score each item from 0 to 2.

| Criterion | 0 | 1 | 2 |
| --- | --- | --- | --- |
| Public-good upside | Mostly private benefit | Plausible public benefit | Clear civic, science, health, education, climate, or OSS infrastructure benefit |
| AI tractability | Requires broad judgment or private context | Bounded but still ambiguous | Narrow action with clear inputs and outputs |
| Human verification | Hard to verify | Verifiable with effort | Verifiable in 10 to 15 minutes |
| Maintainer burden | Likely spammy | Needs careful framing | Artifact-first and respectful of maintainers |
| Risk control | High-stakes or credential-heavy | Some risk with mitigations | No secrets, no private data, no high-stakes recommendations |

Admit a task when it scores at least 8 out of 10 and no item scores 0.

## Artifact Review

A completed artifact should answer:

- What exact public pages, repositories, issues, or package versions were checked?
- What commands were run?
- What changed or what was found?
- What should a human verify?
- If a PR is intended, what title/body is proposed and what tests support it?
- Did the contributor run adversarial review against correctness, scope, maintainer burden, and domain risk?
- Was anything published upstream?
- If upstream publication was blocked, what permission or maintainer input is needed?

## State Transitions

- `open`: no artifact exists yet.
- `artifact-ready`: local artifact exists and verification instructions are clear.
- `pr-ready`: a tested branch, patch, or diff plus PR draft is ready for human approval.
- `published-upstream`: a public upstream issue, PR, discussion, or comment exists.
- `blocked`: useful next action requires permission, credentials, or maintainer input.
- `done`: upstream accepted the result or a human reviewer decided no more action is useful.

Do not mark a task `done` just because an AI produced output. Done requires a human-verifiable terminal state.
