# Verification

A human reviewer should confirm:

- the upstream issue is still open and the imported labels still apply
- the artifact identifies the repository revision or release inspected
- any reproduction or test commands are listed with enough output to understand the result
- the recommended next action does not create maintainer burden
- no private data, credentials, or logged-in personal accounts were used

Useful commands:

```bash
curl -L https://api.github.com/repos/scikit-learn/scikit-learn/issues/22827
git ls-remote https://github.com/scikit-learn/scikit-learn.git HEAD
```

Do not treat a generated task packet as permission to post upstream. Upstream comments and PRs require human approval.
