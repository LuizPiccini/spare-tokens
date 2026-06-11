import { describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { TaskPacketSchema } from "./schema.js";
import { validateTask } from "./tasks.js";

describe("TaskPacketSchema", () => {
  it("accepts a minimal valid task packet", () => {
    const parsed = TaskPacketSchema.parse({
      schema_version: "0.1",
      id: "valid-task",
      title: "Valid task packet",
      summary: "A small but valid public-good task packet.",
      cause_area: "oss-infrastructure",
      project: {
        name: "Example",
        url: "https://example.com",
      },
      impact: {
        importance: "This helps people avoid a real recurring failure mode.",
        tractability: "The output can be produced by an AI with limited context.",
        neglectedness: "The issue is small enough that it is often left undone.",
        beneficiaries: ["maintainers"],
      },
      task: {
        type: "docs-fix",
        difficulty: "low",
        estimated_minutes: 20,
        expected_outputs: ["documentation patch"],
        allowed_actions: ["read docs"],
        pr_policy: "do-not-open-pr",
      },
      verification: {
        human_minutes: 5,
        commands: [],
        evidence_required: ["diff"],
      },
      risk: {
        level: "low",
        notes: "No private data or high-stakes decision is involved.",
      },
      files: {
        context: "context.md",
        verification: "verify.md",
        prompts: {
          codex: "prompts/codex.md",
          claude: "prompts/claude.md",
          gemini: "prompts/gemini.md",
        },
      },
    });

    expect(parsed.id).toBe("valid-task");
  });

  it("accepts lifecycle and artifact metadata", () => {
    const parsed = TaskPacketSchema.parse({
      schema_version: "0.1",
      id: "artifact-task",
      title: "Artifact task packet",
      summary: "A valid public-good task packet with lifecycle metadata.",
      cause_area: "science",
      project: {
        name: "Example",
        url: "https://example.com",
      },
      impact: {
        importance: "This helps reviewers understand a useful public artifact.",
        tractability: "The output can be checked with public information only.",
        neglectedness: "Small review artifacts are often left unpublished.",
        beneficiaries: ["reviewers"],
      },
      task: {
        type: "data-quality-check",
        difficulty: "low",
        estimated_minutes: 30,
        expected_outputs: ["metadata report"],
        allowed_actions: ["read public docs"],
        pr_policy: "do-not-open-pr",
      },
      verification: {
        human_minutes: 10,
        evidence_required: ["report"],
      },
      risk: {
        level: "low",
        notes: "No private data, credentials, or high-stakes decision is involved.",
      },
      lifecycle: {
        state: "artifact-ready",
        last_updated: "2026-06-11",
        notes: "A reviewer can inspect the local artifact before upstream action.",
      },
      artifacts: [
        {
          label: "Report",
          path: "artifacts/report.md",
          type: "report",
          description: "A local report that a reviewer can inspect.",
        },
      ],
      files: {
        context: "context.md",
        verification: "verify.md",
        prompts: {
          codex: "prompts/codex.md",
          claude: "prompts/claude.md",
          gemini: "prompts/gemini.md",
        },
      },
    });

    expect(parsed.lifecycle.state).toBe("artifact-ready");
    expect(parsed.artifacts[0].type).toBe("report");
  });

  it("accepts PR-ready lifecycle and PR draft artifacts", () => {
    const parsed = TaskPacketSchema.parse({
      schema_version: "0.1",
      id: "pr-ready-task",
      title: "PR ready task packet",
      summary: "A valid public-good task packet with a prepared PR draft.",
      cause_area: "oss-infrastructure",
      project: {
        name: "Example",
        url: "https://example.com",
      },
      impact: {
        importance: "This helps maintainers review a small tested contribution.",
        tractability: "The output can be checked with public information only.",
        neglectedness: "Small prepared contributions are often left unfinished.",
        beneficiaries: ["maintainers"],
      },
      task: {
        type: "docs-fix",
        difficulty: "low",
        estimated_minutes: 45,
        expected_outputs: ["tested patch", "PR draft"],
        allowed_actions: ["prepare a PR draft"],
        pr_policy: "allowed-after-human-review",
      },
      verification: {
        human_minutes: 10,
        evidence_required: ["diff", "test output", "PR draft"],
      },
      risk: {
        level: "low",
        notes: "No private data, credentials, or high-stakes decision is involved.",
      },
      lifecycle: {
        state: "pr-ready",
        last_updated: "2026-06-11",
        notes: "A tested change and PR draft are ready for human approval.",
      },
      artifacts: [
        {
          label: "PR draft",
          path: "artifacts/pr-draft.md",
          type: "pr-draft",
          description: "A PR title and body that a reviewer can inspect.",
        },
      ],
      files: {
        context: "context.md",
        verification: "verify.md",
        prompts: {
          codex: "prompts/codex.md",
          claude: "prompts/claude.md",
          gemini: "prompts/gemini.md",
        },
      },
    });

    expect(parsed.lifecycle.state).toBe("pr-ready");
    expect(parsed.artifacts[0].type).toBe("pr-draft");
  });

  it("fails validation when a referenced local artifact is missing", () => {
    const dir = mkdtempSync(join(tmpdir(), "spare-task-"));
    mkdirSync(join(dir, "prompts"));
    writeFileSync(join(dir, "context.md"), "Context");
    writeFileSync(join(dir, "verify.md"), "Verify");
    writeFileSync(join(dir, "prompts", "codex.md"), "Prompt");
    writeFileSync(join(dir, "prompts", "claude.md"), "Prompt");
    writeFileSync(join(dir, "prompts", "gemini.md"), "Prompt");
    writeFileSync(
      join(dir, "task.yaml"),
      [
        'schema_version: "0.1"',
        "id: missing-artifact",
        "title: Missing artifact task",
        "summary: A valid task packet except for a missing artifact.",
        "cause_area: science",
        "project:",
        "  name: Example",
        "  url: https://example.com",
        "impact:",
        "  importance: This helps reviewers catch incomplete artifact metadata.",
        "  tractability: The output can be checked with public information only.",
        "  neglectedness: Small metadata errors are easy to miss in review.",
        "  beneficiaries:",
        "    - reviewers",
        "task:",
        "  type: data-quality-check",
        "  difficulty: low",
        "  estimated_minutes: 30",
        "  expected_outputs:",
        "    - metadata report",
        "  allowed_actions:",
        "    - read public docs",
        "  pr_policy: do-not-open-pr",
        "verification:",
        "  human_minutes: 10",
        "  evidence_required:",
        "    - report",
        "risk:",
        "  level: low",
        "  notes: No private data, credentials, or high-stakes decision is involved.",
        "artifacts:",
        "  - label: Report",
        "    path: artifacts/missing.md",
        "    type: report",
        "    description: A local report that does not exist yet.",
        "files:",
        "  context: context.md",
        "  verification: verify.md",
        "  prompts:",
        "    codex: prompts/codex.md",
        "    claude: prompts/claude.md",
        "    gemini: prompts/gemini.md",
      ].join("\n"),
    );

    const result = validateTask(join(dir, "task.yaml"));
    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain("missing referenced file artifacts/missing.md");
  });
});
