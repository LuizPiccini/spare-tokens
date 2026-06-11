# Verification

A human reviewer should confirm:

- the upstream issue is still open and the imported labels still apply
- the artifact identifies the repository revision or release inspected
- any code, docs, reproduction, or test change is small and issue-focused
- test commands are listed with enough output to understand the result
- adversarial review notes address correctness, scope, maintainer burden, and domain risk
- the PR title/body draft is accurate and does not overclaim
- no private data, credentials, or logged-in personal accounts were used

Useful commands:

```bash
curl -L https://api.github.com/repos/matplotlib/matplotlib/issues/17479
git ls-remote https://github.com/matplotlib/matplotlib.git HEAD
```

Do not treat a generated task packet as permission to post upstream. PRs and comments require human approval unless the user explicitly approved PR submission for this selected task.
