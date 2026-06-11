import { mkdtempSync } from "node:fs";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildGeneratedGitHubTask,
  GitHubIssue,
  writeGeneratedTasks,
} from "./github.js";
import { TaskPacketSchema } from "./schema.js";
import { GitHubIssueSource } from "./sources.js";

describe("GitHub issue importer", () => {
  it("turns a public GitHub issue into a valid task packet", () => {
    const generated = buildGeneratedGitHubTask(source(), issue(), "2026-06-11");

    const parsed = TaskPacketSchema.parse(generated.packet);

    expect(generated.id).toBe("example-project-issue-42");
    expect(parsed.origin?.type).toBe("github-issue");
    expect(parsed.origin?.repository).toBe("example/project");
    expect(parsed.origin?.signal_labels).toEqual([
      "good first issue",
      "documentation",
    ]);
    expect(parsed.task.pr_policy).toBe("allowed-after-human-review");
    expect(parsed.lifecycle.upstream[0].state).toBe("published");
    expect(generated.files["context.md"]).toContain("Fix confusing docs example");
    expect(generated.files["prompts/codex.md"]).toContain("Run an adversarial review");
    expect(generated.files["prompts/codex.md"]).toContain("Prepare a PR title and body");
  });

  it("writes generated task files and skips existing directories by default", () => {
    const dir = mkdtempSync(join(tmpdir(), "spare-github-"));
    const generated = buildGeneratedGitHubTask(source(), issue(), "2026-06-11");

    const first = writeGeneratedTasks([generated], dir, { overwrite: false });
    const second = writeGeneratedTasks([generated], dir, { overwrite: false });

    expect(first[0].written).toBe(true);
    expect(second[0].skipped).toBe(true);
    expect(existsSync(join(dir, generated.id, "task.yaml"))).toBe(true);
    expect(existsSync(join(dir, generated.id, "prompts", "codex.md"))).toBe(true);
  });
});

function source(): GitHubIssueSource {
  return {
    id: "example-source",
    repository: "example/project",
    project_name: "Example Project",
    project_url: "https://example.com",
    cause_area: "science",
    labels: ["good first issue"],
    task_type: "issue-triage",
    difficulty: "medium",
    estimated_minutes: 60,
    human_minutes: 15,
    risk_level: "low",
    pr_policy: "allowed-after-human-review",
    importance: "This example project supports public-interest test workflows.",
    tractability: "The issue is bounded enough to inspect with public context.",
    neglectedness: "Small maintainer-labeled issues can remain unattempted.",
    beneficiaries: ["maintainers"],
    allowed_actions: ["read public issue text", "open a PR only after human approval"],
    expected_outputs: ["tested change", "PR draft"],
  };
}

function issue(): GitHubIssue {
  return {
    number: 42,
    title: "Fix confusing docs example",
    html_url: "https://github.com/example/project/issues/42",
    body: "The docs example is confusing and needs a clearer assertion.",
    created_at: "2026-06-01T00:00:00Z",
    updated_at: "2026-06-10T00:00:00Z",
    comments: 2,
    labels: [{ name: "good first issue" }, { name: "documentation" }],
    user: { login: "maintainer" },
  };
}
