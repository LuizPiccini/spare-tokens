Work on the public GitHub issue https://github.com/opensafely-core/job-server/issues/1261.

Goal: produce the smallest useful upstream-ready contribution for this issue. A useful outcome can be a tested fix, docs patch, reproduction, or a clear stop report if the issue is stale, too broad, or not reproducible.

Workflow:

1. Re-check the issue. Confirm it is still open, read recent comments, and verify the labels still describe agent-tractable work. Stop if it is closed, assigned with active work, blocked on maintainer design, security-sensitive, or too broad.
2. Clone or open the upstream repository and read its README, CONTRIBUTING guide, and relevant test instructions.
3. Create a local branch such as codex/spare-tokens-opensafely-core-job-server-issue-1261. Keep the diff narrow and tied to the issue.
4. Implement the smallest useful change. Prefer docs, tests, minimal reproductions, and targeted fixes over broad rewrites.
5. Run the most relevant tests, docs builds, examples, or linters you can identify. If full tests are too expensive, run targeted checks and say what was not run.
6. Run an adversarial review before proposing upstream action:
   - Does the change actually address the issue?
   - Is the issue still current on the inspected revision?
   - Is the diff small enough for a maintainer to review quickly?
   - Are tests/docs enough for a human reviewer to verify the work?
   - Could this create maintainer burden, user harm, or domain-risk confusion?
   - Did you avoid private data, credentials, and logged-in personal accounts?
7. Prepare a PR title and body with issue link, summary, tests run, and adversarial review notes.
8. Ask the user before pushing a branch, opening a PR, or posting an upstream comment. If the user already gave explicit approval for PR submission for this selected task, open the PR only after the checks and adversarial review pass.

Required final output:
- issue URL, title, labels, and current upstream status
- repository revision or release inspected
- files changed or artifact path produced
- commands run and relevant output
- adversarial review result
- PR title/body draft, or the reason no PR should be opened