# Improve tests by using global_random_seed fixture to make them less seed-sensitive
Imported from: scikit-learn-help-wanted
Repository: scikit-learn/scikit-learn
Issue: #22827 https://github.com/scikit-learn/scikit-learn/issues/22827
Issue author: ogrisel
Labels: help wanted, Low Priority, Hard, module:test-suite, Meta-issue
Created: 2022-03-14T10:15:11Z
Updated: 2026-06-09T11:01:06Z
Comments: 37
## Source Rationale
scikit-learn is core scientific and machine-learning infrastructure used by researchers, civic technologists, educators, and applied teams.
Source note: Prefer bounded reproductions, tests, documentation clarifications, and issue narrowing over broad algorithm design work.
## Issue Body Excerpt
## Context: the new `global_random_seed` fixture

#22749 introduces a new `global_random_seed` fixture to make it possible to run the same test with any seed between 0 and 99 included. By default, when `SKLEARN_TESTS_GLOBAL_RANDOM_SEED` is not set, this fixture is deterministically returning 42 to keep test runs deterministic by default and avoid any unnecessary disruption. However different CI builds set this seed to other arbitrary values (still deterministic) and nightly schedule builds on Azure now use `SKLEARN_TESTS_GLOBAL_RANDOM_SEED="any"` to progressively explore any seed on the 0-99 range.

## Motivation

The aim of this new fixture is to make sure that we avoid writing tests that artificially depend on a specific value of the random seed and therefore hiding a real mathematical problem in our code unknowingly (see e.g. https://github.com/scikit-learn/scikit-learn/pull/21701#discussion_r823847947). At the same time we still want to keep the test deterministic and independent of the execution order by default to avoid introducing unnecessary maintenance overhead.

In addition to making the tests insensitive, randomizing those tests with different seeds has the side benefit of making the assertions of those tests robust to small numerical variations that could otherwise stem from other sources such as platform-specific / dependency-specific numerical rounding variations that we do not cover in our existing CI infrastructure.

More details about the fixture in the online dev doc for the `SKLEARN_TESTS_GLOBAL_RANDOM_SEED` env variable:

https://scikit-learn.org/dev/computing/parallelism.html#environment-variables

## Guidelines to convert existing tests

- We probably do not need to convert all scikit-learn tests to use this fixture. We should instead focus our efforts on tests that actually check for **important mathematical properties** of our estimators or model evaluation tools. For instance, there is no need to check for the seed-insensitivity of tests that checks for the exception messages raised when passing invalid inputs.

- To avoid having to review huge PRs that impact many files at once and can lead to conflicts, let's open PRs that edit at most one test file at a time. For instance use a title such as:

> TST use global_random_seed in sklearn/_loss/tests/test_glm_distribution.py

- Please reference `#22827` in the description of the PR and put the full filename of the test file you edit in the title of the PR.

- To convert an existing test with a fixed seed, the general pattern is to rewrite a function such as:

```python
def test_some

[truncated]