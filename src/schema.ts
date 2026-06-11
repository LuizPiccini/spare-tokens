import { z } from "zod";

export const CauseAreaSchema = z.enum([
  "oss-infrastructure",
  "civic-tech",
  "science",
  "health",
  "climate",
  "education",
  "other",
]);

export const TaskTypeSchema = z.enum([
  "docs-fix",
  "minimal-repro",
  "test-gap",
  "issue-triage",
  "accessibility-report",
  "benchmark-report",
  "data-quality-check",
]);

export const PrPolicySchema = z.enum([
  "do-not-open-pr",
  "allowed-after-human-review",
  "maintainer-welcomes-pr",
]);

export const RiskLevelSchema = z.enum(["low", "medium", "high"]);

export const LifecycleStateSchema = z.enum([
  "open",
  "artifact-ready",
  "published-upstream",
  "blocked",
  "done",
]);

export const UpstreamStateSchema = z.enum([
  "not-started",
  "drafted",
  "published",
  "blocked",
  "merged",
  "closed",
]);

export const ArtifactTypeSchema = z.enum([
  "repro",
  "report",
  "patch",
  "triage",
  "issue-draft",
  "upstream-status",
  "benchmark",
  "data",
  "other",
]);

export const TaskPacketSchema = z.object({
  schema_version: z.literal("0.1"),
  id: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase kebab-case"),
  title: z.string().min(8),
  summary: z.string().min(20),
  cause_area: CauseAreaSchema,
  project: z.object({
    name: z.string().min(1),
    url: z.string().url(),
    repository: z.string().url().optional(),
    maintainers_contacted: z.boolean().default(false),
  }),
  impact: z.object({
    importance: z.string().min(20),
    tractability: z.string().min(20),
    neglectedness: z.string().min(20),
    beneficiaries: z.array(z.string().min(1)).min(1),
  }),
  task: z.object({
    type: TaskTypeSchema,
    difficulty: z.enum(["low", "medium", "high"]),
    estimated_minutes: z.number().int().positive().max(240),
    expected_outputs: z.array(z.string().min(1)).min(1),
    allowed_actions: z.array(z.string().min(1)).min(1),
    pr_policy: PrPolicySchema,
  }),
  verification: z.object({
    human_minutes: z.number().int().positive().max(60),
    commands: z.array(z.string()).default([]),
    evidence_required: z.array(z.string().min(1)).min(1),
  }),
  risk: z.object({
    level: RiskLevelSchema,
    notes: z.string().min(20),
  }),
  sources: z
    .array(
      z.object({
        label: z.string().min(1),
        url: z.string().url(),
      }),
    )
    .default([]),
  lifecycle: z
    .object({
      state: LifecycleStateSchema,
      last_updated: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
      owner: z.string().min(1).optional(),
      notes: z.string().min(20),
      upstream: z
        .array(
          z.object({
            label: z.string().min(1),
            url: z.string().url().optional(),
            state: UpstreamStateSchema,
            notes: z.string().min(10).optional(),
          }),
        )
        .default([]),
    })
    .default({
      state: "open",
      last_updated: "2026-06-11",
      notes: "Task has not yet been attempted by a contributor.",
      upstream: [],
    }),
  artifacts: z
    .array(
      z.object({
        label: z.string().min(1),
        path: z.string().min(1),
        type: ArtifactTypeSchema,
        description: z.string().min(20),
      }),
    )
    .default([]),
  files: z.object({
    context: z.string().min(1),
    verification: z.string().min(1),
    prompts: z.object({
      codex: z.string().min(1),
      claude: z.string().min(1),
      gemini: z.string().min(1),
    }),
  }),
});

export type TaskPacket = z.infer<typeof TaskPacketSchema>;
export type PromptTarget = keyof TaskPacket["files"]["prompts"];
