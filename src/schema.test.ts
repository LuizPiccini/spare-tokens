import { describe, expect, it } from "vitest";
import { TaskPacketSchema } from "./schema.js";

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
});

