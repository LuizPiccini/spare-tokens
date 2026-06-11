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

