import { readFileSync } from "node:fs";
import YAML from "yaml";
import { z } from "zod";
import {
  CauseAreaSchema,
  PrPolicySchema,
  RiskLevelSchema,
  TaskTypeSchema,
} from "./schema.js";

export const GitHubIssueSourceSchema = z.object({
  id: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase kebab-case"),
  repository: z
    .string()
    .regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/, "Use owner/repo"),
  project_name: z.string().min(1),
  project_url: z.string().url(),
  cause_area: CauseAreaSchema,
  labels: z.array(z.string().min(1)).min(1),
  exclude_labels: z.array(z.string().min(1)).default([]),
  task_type: TaskTypeSchema.default("issue-triage"),
  difficulty: z.enum(["low", "medium", "high"]).default("medium"),
  estimated_minutes: z.number().int().positive().max(240).default(60),
  human_minutes: z.number().int().positive().max(60).default(15),
  risk_level: RiskLevelSchema.default("low"),
  pr_policy: PrPolicySchema.default("allowed-after-human-review"),
  importance: z.string().min(20),
  tractability: z
    .string()
    .min(20)
    .default(
      "Maintainer-labeled issues usually provide a bounded public context for triage, docs, tests, or reproduction work.",
    ),
  neglectedness: z
    .string()
    .min(20)
    .default(
      "Open issues with contributor-friendly labels can sit unattempted even when a small artifact would help maintainers.",
    ),
  beneficiaries: z.array(z.string().min(1)).min(1),
  allowed_actions: z
    .array(z.string().min(1))
    .min(1)
    .default([
      "read public GitHub issue text",
      "clone the public repository",
      "run local tests, docs builds, linters, or reproduction commands",
      "create a local branch with the smallest useful change",
      "run an adversarial self-review before proposing upstream action",
      "prepare PR title and body for human review",
      "open a PR only after human approval",
    ]),
  expected_outputs: z
    .array(z.string().min(1))
    .min(1)
    .default([
      "small code, docs, or test change when tractable",
      "test output and adversarial review notes",
      "PR title and body draft for human approval",
    ]),
  notes: z.string().optional(),
});

export const SourceRegistrySchema = z.object({
  schema_version: z.literal("0.1"),
  github: z.array(GitHubIssueSourceSchema).min(1),
});

export type GitHubIssueSource = z.infer<typeof GitHubIssueSourceSchema>;
export type SourceRegistry = z.infer<typeof SourceRegistrySchema>;

export function loadSourceRegistry(path: string): SourceRegistry {
  const raw = readFileSync(path, "utf8");
  return SourceRegistrySchema.parse(YAML.parse(raw));
}

export function selectGitHubSources(
  registry: SourceRegistry,
  sourceId: string,
): GitHubIssueSource[] {
  if (sourceId === "all") {
    return registry.github;
  }

  const source = registry.github.find((entry) => entry.id === sourceId);
  if (!source) {
    const known = registry.github.map((entry) => entry.id).join(", ");
    throw new Error(`Unknown GitHub source: ${sourceId}. Known sources: ${known}`);
  }

  return [source];
}
