import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import YAML from "yaml";
import { TaskPacket } from "./schema.js";
import { GitHubIssueSource } from "./sources.js";

export type GitHubIssue = {
  number: number;
  title: string;
  html_url: string;
  body: string | null;
  created_at: string;
  updated_at: string;
  comments: number;
  labels: Array<{ name: string }>;
  user?: { login: string };
};

export type GeneratedGitHubTask = {
  id: string;
  source: GitHubIssueSource;
  issue: GitHubIssue;
  packet: TaskPacket;
  files: Record<string, string>;
};

export type FetchGitHubIssueOptions = {
  limitPerSource: number;
  token?: string;
  continueOnError?: boolean;
  onWarning?: (message: string) => void;
};

export type WriteGeneratedTaskResult = {
  task: GeneratedGitHubTask;
  dir: string;
  written: boolean;
  skipped: boolean;
};

const signalLabels = new Set([
  "good first issue",
  "help wanted",
  "documentation",
  "docs",
  "test",
  "tests",
  "repro needed",
  "needs reproduction",
]);

const defaultExcludedLabels = new Set([
  "blocked",
  "hard",
  "meta-issue",
  "needs decision",
  "needs design",
  "security",
]);

export async function fetchIssuesForSources(
  sources: GitHubIssueSource[],
  options: FetchGitHubIssueOptions,
): Promise<GeneratedGitHubTask[]> {
  const generated: GeneratedGitHubTask[] = [];

  for (const source of sources) {
    let issues: GitHubIssue[];
    try {
      issues = await fetchIssuesForSource(source, options);
    } catch (error) {
      if (!options.continueOnError) {
        throw error;
      }
      options.onWarning?.(error instanceof Error ? error.message : String(error));
      continue;
    }
    for (const issue of issues) {
      generated.push(buildGeneratedGitHubTask(source, issue, today()));
    }
  }

  return generated;
}

export async function fetchIssuesForSource(
  source: GitHubIssueSource,
  options: FetchGitHubIssueOptions,
): Promise<GitHubIssue[]> {
  const byUrl = new Map<string, GitHubIssue>();

  for (const label of source.labels) {
    const query = `repo:${source.repository} is:issue is:open label:"${label}"`;
    const url = new URL("https://api.github.com/search/issues");
    url.searchParams.set("q", query);
    url.searchParams.set("sort", "updated");
    url.searchParams.set("order", "desc");
    url.searchParams.set("per_page", String(Math.min(Math.max(options.limitPerSource * 2, 5), 20)));

    const response = await fetch(url, {
      headers: githubHeaders(options.token),
    });

    if (!response.ok) {
      throw new Error(await formatGitHubError(response, source, label));
    }

    const payload = (await response.json()) as { items?: GitHubIssue[] };
    for (const issue of payload.items ?? []) {
      if (shouldExcludeIssue(source, issue)) {
        continue;
      }
      byUrl.set(issue.html_url, issue);
    }
  }

  return [...byUrl.values()]
    .sort(compareIssuesForImport)
    .slice(0, options.limitPerSource);
}

export function buildGeneratedGitHubTask(
  source: GitHubIssueSource,
  issue: GitHubIssue,
  importedAt: string,
): GeneratedGitHubTask {
  const id = `${slugify(source.repository)}-issue-${issue.number}`;
  const labels = issue.labels.map((label) => label.name);
  const matchedSignalLabels = labels.filter((label) =>
    signalLabels.has(label.toLowerCase()),
  );
  const taskType = deriveTaskType(source, labels);
  const difficulty = labels.some((label) => label.toLowerCase() === "good first issue")
    ? "low"
    : source.difficulty;
  const repositoryUrl = `https://github.com/${source.repository}`;
  const riskNotes =
    source.risk_level === "medium"
      ? "This is developer-facing OSS work in a sensitive domain. Do not use private data, make clinical claims, or post upstream without human review."
      : "This task uses public issue and repository data only and defaults to a local artifact before any upstream action.";

  const packet: TaskPacket = {
    schema_version: "0.1",
    id,
    title: issue.title.length >= 8 ? issue.title : `GitHub issue ${issue.number}`,
    summary: `Turn maintainer-signaled GitHub issue #${issue.number} in ${source.repository} into a small, tested contribution or a clear stop report.`,
    cause_area: source.cause_area,
    project: {
      name: source.project_name,
      url: source.project_url,
      repository: repositoryUrl,
      maintainers_contacted: false,
    },
    impact: {
      importance: source.importance,
      tractability: source.tractability,
      neglectedness: source.neglectedness,
      beneficiaries: source.beneficiaries,
    },
    task: {
      type: taskType,
      difficulty,
      estimated_minutes: source.estimated_minutes,
      expected_outputs: source.expected_outputs,
      allowed_actions: source.allowed_actions,
      pr_policy: source.pr_policy,
    },
    verification: {
      human_minutes: source.human_minutes,
      commands: [
        `curl -L https://api.github.com/repos/${source.repository}/issues/${issue.number}`,
        `git ls-remote https://github.com/${source.repository}.git HEAD`,
      ],
      evidence_required: [
        "current upstream issue URL, title, and labels",
        "commands attempted and relevant output snippets",
        "local artifact with findings, uncertainty, and recommended next action",
      ],
    },
    risk: {
      level: source.risk_level,
      notes: riskNotes,
    },
    sources: [
      {
        label: `GitHub issue #${issue.number}`,
        url: issue.html_url,
      },
      {
        label: `${source.repository} repository`,
        url: repositoryUrl,
      },
    ],
    lifecycle: {
      state: "open",
      last_updated: importedAt,
      notes: "Imported from a maintainer-labeled GitHub issue; ready for a human-selected agent run.",
      upstream: [
        {
          label: `GitHub issue #${issue.number}`,
          url: issue.html_url,
          state: "published",
          notes: "Existing upstream issue; no Spare Tokens artifact has been posted.",
        },
      ],
    },
    artifacts: [],
    files: {
      context: "context.md",
      verification: "verify.md",
      prompts: {
        codex: "prompts/codex.md",
        claude: "prompts/claude.md",
        gemini: "prompts/gemini.md",
      },
    },
    origin: {
      type: "github-issue",
      source_id: source.id,
      repository: source.repository,
      issue_number: issue.number,
      issue_url: issue.html_url,
      labels,
      signal_labels: matchedSignalLabels,
      imported_at: importedAt,
    },
  };

  return {
    id,
    source,
    issue,
    packet,
    files: buildTaskFiles(source, issue, packet),
  };
}

export function writeGeneratedTasks(
  tasks: GeneratedGitHubTask[],
  outRoot: string,
  options: { overwrite: boolean },
): WriteGeneratedTaskResult[] {
  return tasks.map((task) => writeGeneratedTask(task, outRoot, options));
}

function writeGeneratedTask(
  task: GeneratedGitHubTask,
  outRoot: string,
  options: { overwrite: boolean },
): WriteGeneratedTaskResult {
  const dir = join(outRoot, task.id);
  if (existsSync(dir) && !options.overwrite) {
    return { task, dir, written: false, skipped: true };
  }

  mkdirSync(join(dir, "prompts"), { recursive: true });
  writeFileSync(join(dir, "task.yaml"), YAML.stringify(task.packet), "utf8");

  for (const [relativePath, content] of Object.entries(task.files)) {
    writeFileSync(join(dir, relativePath), content, "utf8");
  }

  return { task, dir, written: true, skipped: false };
}

function buildTaskFiles(
  source: GitHubIssueSource,
  issue: GitHubIssue,
  packet: TaskPacket,
): Record<string, string> {
  const body = truncate(issue.body?.trim() || "No issue body was provided.", 2600);
  const labels = issue.labels.map((label) => label.name).join(", ") || "none";
  const prompt = [
    `Work on the public GitHub issue ${issue.html_url}.`,
    "",
    "Goal: produce the smallest useful upstream-ready contribution for this issue. A useful outcome can be a tested fix, docs patch, reproduction, or a clear stop report if the issue is stale, too broad, or not reproducible.",
    "",
    "Workflow:",
    "",
    "1. Re-check the issue. Confirm it is still open, read recent comments, and verify the labels still describe agent-tractable work. Stop if it is closed, assigned with active work, blocked on maintainer design, security-sensitive, or too broad.",
    "2. Clone or open the upstream repository and read its README, CONTRIBUTING guide, and relevant test instructions.",
    `3. Create a local branch such as codex/spare-tokens-${packet.id}. Keep the diff narrow and tied to the issue.`,
    "4. Implement the smallest useful change. Prefer docs, tests, minimal reproductions, and targeted fixes over broad rewrites.",
    "5. Run the most relevant tests, docs builds, examples, or linters you can identify. If full tests are too expensive, run targeted checks and say what was not run.",
    "6. Run an adversarial review before proposing upstream action:",
    "   - Does the change actually address the issue?",
    "   - Is the issue still current on the inspected revision?",
    "   - Is the diff small enough for a maintainer to review quickly?",
    "   - Are tests/docs enough for a human reviewer to verify the work?",
    "   - Could this create maintainer burden, user harm, or domain-risk confusion?",
    "   - Did you avoid private data, credentials, and logged-in personal accounts?",
    "7. Prepare a PR title and body with issue link, summary, tests run, and adversarial review notes.",
    "8. Ask the user before pushing a branch, opening a PR, or posting an upstream comment. If the user already gave explicit approval for PR submission for this selected task, open the PR only after the checks and adversarial review pass.",
    "",
    "Required final output:",
    "- issue URL, title, labels, and current upstream status",
    "- repository revision or release inspected",
    "- files changed or artifact path produced",
    "- commands run and relevant output",
    "- adversarial review result",
    "- PR title/body draft, or the reason no PR should be opened",
  ].join("\n");

  const context = [
    `# ${packet.title}`,
    "",
    `Imported from: ${source.id}`,
    `Repository: ${source.repository}`,
    `Issue: #${issue.number} ${issue.html_url}`,
    `Issue author: ${issue.user?.login ?? "unknown"}`,
    `Labels: ${labels}`,
    `Created: ${issue.created_at}`,
    `Updated: ${issue.updated_at}`,
    `Comments: ${issue.comments}`,
    "",
    "## Source Rationale",
    "",
    source.importance,
    "",
    source.notes ? `Source note: ${source.notes}` : "",
    "",
    "## Issue Body Excerpt",
    "",
    body,
    "",
  ]
    .filter(Boolean)
    .join("\n");

  const verify = [
    "# Verification",
    "",
    "A human reviewer should confirm:",
    "",
    "- the upstream issue is still open and the imported labels still apply",
    "- the artifact identifies the repository revision or release inspected",
    "- any code, docs, reproduction, or test change is small and issue-focused",
    "- test commands are listed with enough output to understand the result",
    "- adversarial review notes address correctness, scope, maintainer burden, and domain risk",
    "- the PR title/body draft is accurate and does not overclaim",
    "- no private data, credentials, or logged-in personal accounts were used",
    "",
    "Useful commands:",
    "",
    "```bash",
    `curl -L https://api.github.com/repos/${source.repository}/issues/${issue.number}`,
    `git ls-remote https://github.com/${source.repository}.git HEAD`,
    "```",
    "",
    "Do not treat a generated task packet as permission to post upstream. PRs and comments require human approval unless the user explicitly approved PR submission for this selected task.",
    "",
  ].join("\n");

  return {
    "context.md": context,
    "verify.md": verify,
    "prompts/codex.md": prompt,
    "prompts/claude.md": prompt,
    "prompts/gemini.md": prompt,
  };
}

function compareIssuesForImport(a: GitHubIssue, b: GitHubIssue): number {
  const scoreDelta = issueImportScore(b) - issueImportScore(a);
  if (scoreDelta !== 0) {
    return scoreDelta;
  }
  return Date.parse(b.updated_at) - Date.parse(a.updated_at);
}

function issueImportScore(issue: GitHubIssue): number {
  const labels = issue.labels.map((label) => label.name.toLowerCase());
  let score = 0;
  if (labels.includes("good first issue")) score += 4;
  if (labels.includes("help wanted")) score += 3;
  if (labels.some((label) => label.includes("doc"))) score += 2;
  if (labels.some((label) => label.includes("test"))) score += 2;
  if (labels.some((label) => label.includes("repro"))) score += 1;
  return score;
}

function shouldExcludeIssue(
  source: GitHubIssueSource,
  issue: GitHubIssue,
): boolean {
  const excluded = new Set([
    ...defaultExcludedLabels,
    ...source.exclude_labels.map((label) => label.toLowerCase()),
  ]);
  return issue.labels.some((label) => excluded.has(label.name.toLowerCase()));
}

function deriveTaskType(
  source: GitHubIssueSource,
  labels: string[],
): TaskPacket["task"]["type"] {
  const normalized = labels.map((label) => label.toLowerCase());
  if (normalized.some((label) => label.includes("doc"))) {
    return "docs-fix";
  }
  if (normalized.some((label) => label.includes("test"))) {
    return "test-gap";
  }
  if (
    normalized.some(
      (label) =>
        label.includes("bug") ||
        label.includes("repro") ||
        label.includes("regression"),
    )
  ) {
    return "minimal-repro";
  }
  return source.task_type;
}

function githubHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "spare-tokens",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function formatGitHubError(
  response: Response,
  source: GitHubIssueSource,
  label: string,
): Promise<string> {
  let message = response.statusText;
  try {
    const payload = (await response.json()) as { message?: string };
    if (payload.message) {
      message = payload.message;
    }
  } catch {
    // Keep status text if the API did not return JSON.
  }
  return `GitHub search failed for ${source.repository} label "${label}" (${response.status}): ${message}`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength).trimEnd()}\n\n[truncated]`;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
