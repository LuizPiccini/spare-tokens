import { describe, expect, it } from "vitest";
import {
  formatPickList,
  rankOpenTasks,
  resolveRankedSelection,
} from "./picker.js";
import { TaskPacket, TaskPacketSchema } from "./schema.js";
import { LoadedTask } from "./tasks.js";

describe("picker", () => {
  it("ranks only open tasks by public-good fit, tractability, verification, and risk", () => {
    const ranked = rankOpenTasks([
      task("slow-medium-risk", {
        cause_area: "education",
        task: { difficulty: "high", estimated_minutes: 180 },
        verification: { human_minutes: 45 },
        risk: { level: "medium" },
      }),
      task("fast-health-task", {
        cause_area: "health",
        task: { difficulty: "low", estimated_minutes: 25 },
        verification: { human_minutes: 8 },
        risk: { level: "low" },
      }),
      task("already-done", {
        lifecycle: { state: "artifact-ready" },
      }),
    ]);

    expect(ranked.map((item) => item.task.packet.id)).toEqual([
      "fast-health-task",
      "slow-medium-risk",
    ]);
    expect(ranked[0].rank).toBe(1);
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });

  it("filters by cause area and maximum risk", () => {
    const ranked = rankOpenTasks(
      [
        task("civic-low", {
          cause_area: "civic-tech",
          risk: { level: "low" },
        }),
        task("civic-high", {
          cause_area: "civic-tech",
          risk: { level: "high" },
        }),
        task("science-low", {
          cause_area: "science",
          risk: { level: "low" },
        }),
      ],
      { causeArea: "civic-tech", maxRisk: "medium" },
    );

    expect(ranked.map((item) => item.task.packet.id)).toEqual(["civic-low"]);
  });

  it("resolves selections by rank number or task id", () => {
    const ranked = rankOpenTasks([
      task("first-task", {
        cause_area: "health",
      }),
      task("second-task", {
        cause_area: "education",
      }),
    ]);

    expect(resolveRankedSelection(ranked, "1")?.task.packet.id).toBe("first-task");
    expect(resolveRankedSelection(ranked, "second-task")?.task.packet.id).toBe(
      "second-task",
    );
    expect(resolveRankedSelection(ranked, "missing")).toBeUndefined();
  });

  it("formats the top-task list with a follow-up export command", () => {
    const ranked = rankOpenTasks([
      task("first-task", {
        cause_area: "health",
      }),
    ]);

    const output = formatPickList(ranked, {
      target: "codex",
      limit: 5,
      commandName: "spare",
    });

    expect(output).toContain("Top 1 open Spare Tokens tasks");
    expect(output).toContain("1. first-task");
    expect(output).toContain("spare pick --target codex --select 1");
  });

  it("boosts imported maintainer-signaled GitHub issues", () => {
    const ranked = rankOpenTasks([
      task("plain-health-task", {
        cause_area: "health",
      }),
      task("github-science-task", {
        cause_area: "science",
        origin: {
          type: "github-issue",
          source_id: "example-source",
          repository: "example/project",
          issue_number: 42,
          issue_url: "https://github.com/example/project/issues/42",
          labels: ["help wanted"],
          signal_labels: ["help wanted"],
          imported_at: "2026-06-11",
        },
      }),
    ]);

    expect(ranked[0].task.packet.id).toBe("github-science-task");
    expect(ranked[0].reasons).toContain("maintainer-signaled GitHub issue");
    expect(formatPickList(ranked, { target: "codex", limit: 1 })).toContain(
      "Source: GitHub example/project#42",
    );
  });

  it("penalizes imported issues with broad or hard labels", () => {
    const ranked = rankOpenTasks([
      task("plain-science-task", {
        cause_area: "science",
      }),
      task("hard-github-task", {
        cause_area: "science",
        origin: {
          type: "github-issue",
          repository: "example/project",
          issue_number: 42,
          issue_url: "https://github.com/example/project/issues/42",
          labels: ["help wanted", "Hard", "Meta-issue"],
          signal_labels: ["help wanted"],
          imported_at: "2026-06-11",
        },
      }),
    ]);

    expect(ranked[0].task.packet.id).toBe("plain-science-task");
    expect(ranked[1].reasons).toContain("broad or hard upstream label");
  });
});

function task(
  id: string,
  overrides: {
    cause_area?: TaskPacket["cause_area"];
    task?: Partial<TaskPacket["task"]>;
    verification?: Partial<TaskPacket["verification"]>;
    risk?: Partial<TaskPacket["risk"]>;
    lifecycle?: Partial<TaskPacket["lifecycle"]>;
    origin?: TaskPacket["origin"];
  } = {},
): LoadedTask {
  const packet = TaskPacketSchema.parse({
    schema_version: "0.1",
    id,
    title: `Task packet ${id}`,
    summary: "A valid public-good task packet for picker tests.",
    cause_area: overrides.cause_area ?? "science",
    project: {
      name: "Example",
      url: "https://example.com",
    },
    impact: {
      importance: "This task has a clear public-good motivation.",
      tractability: "The output can be produced with bounded public context.",
      neglectedness: "Small artifacts like this are easy to leave undone.",
      beneficiaries: ["reviewers"],
    },
    task: {
      type: "docs-fix",
      difficulty: "low",
      estimated_minutes: 30,
      expected_outputs: ["report"],
      allowed_actions: ["read public docs"],
      pr_policy: "do-not-open-pr",
      ...overrides.task,
    },
    verification: {
      human_minutes: 10,
      commands: [],
      evidence_required: ["report"],
      ...overrides.verification,
    },
    risk: {
      level: "low",
      notes: "No private data, credentials, or high-stakes decision is involved.",
      ...overrides.risk,
    },
    sources: [{ label: "Example", url: "https://example.com" }],
    lifecycle: {
      state: "open",
      last_updated: "2026-06-11",
      notes: "Task has not yet been attempted by a contributor.",
      upstream: [],
      ...overrides.lifecycle,
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
    origin: overrides.origin,
  });

  return {
    dir: ".",
    yamlPath: `${id}/task.yaml`,
    packet,
  };
}
