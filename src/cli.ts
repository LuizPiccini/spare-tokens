#!/usr/bin/env node
import { Command } from "commander";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { writeCatalog } from "./catalog.js";
import {
  fetchIssuesForSources,
  writeGeneratedTasks,
} from "./github.js";
import {
  formatPickList,
  rankOpenTasks,
  resolveRankedSelection,
  summarizeRankedTask,
} from "./picker.js";
import { exportPrompt } from "./prompts.js";
import { CauseAreaSchema, PromptTarget, RiskLevelSchema } from "./schema.js";
import {
  GitHubIssueSource,
  GitHubIssueSourceSchema,
  loadSourceRegistry,
  selectGitHubSources,
} from "./sources.js";
import { findTaskYamlPaths, loadValidTasks, validateTask } from "./tasks.js";

const program = new Command();
const defaultTasksPath = join(packageRoot(), "tasks");
const defaultSourcesPath = join(packageRoot(), "sources.yaml");

program
  .name("spare")
  .description("Pick, validate, and export AI-ready public-good tasks.")
  .version("0.7.0");

program
  .command("validate")
  .description("Validate one task packet or every task packet under a directory.")
  .argument("[path]", "task directory, task.yaml, or tasks root", defaultTasksPath)
  .action((inputPath: string) => {
    const paths = findTaskYamlPaths(inputPath);
    const results = paths.map(validateTask);
    const failures = results.filter((result) => !result.ok);

    for (const result of results) {
      if (result.ok && result.task) {
        console.log(`[PASS] ${result.task.packet.id}`);
      }
    }

    if (failures.length > 0) {
      for (const failure of failures) {
        for (const error of failure.errors) {
          console.error(`[FAIL] ${error}`);
        }
      }
      process.exitCode = 1;
      return;
    }

    console.log(`Validated ${results.length} task packet(s).`);
  });

program
  .command("list")
  .description("List valid task packets.")
  .argument("[path]", "tasks root", defaultTasksPath)
  .action((inputPath: string) => {
    const tasks = loadValidTasks(inputPath);
    for (const task of tasks) {
      console.log(`${task.packet.id}\t${task.packet.cause_area}\t${task.packet.title}`);
    }
  });

program
  .command("export")
  .description("Export a target-specific prompt for a task packet.")
  .argument("<task>", "task id, task directory, or task.yaml")
  .option("-t, --target <target>", "codex, claude, or gemini", "codex")
  .action((taskPath: string, options: { target: string }) => {
    const target = parseTarget(options.target);
    const tasks = loadValidTasks(resolveTaskInput(taskPath));
    if (tasks.length !== 1) {
      throw new Error(`Expected one task, got ${tasks.length}`);
    }
    console.log(exportPrompt(tasks[0], target));
  });

program
  .command("catalog")
  .description("Generate a self-contained static HTML catalog.")
  .argument("[path]", "tasks root", defaultTasksPath)
  .option("-o, --out <path>", "output HTML path", "public/index.html")
  .action((inputPath: string, options: { out: string }) => {
    const tasks = loadValidTasks(inputPath);
    writeCatalog(tasks, options.out);
    console.log(`Wrote ${options.out} with ${tasks.length} task(s).`);
  });

program
  .command("sources")
  .description("List curated GitHub issue sources.")
  .argument("[registry]", "source registry YAML path", defaultSourcesPath)
  .action((registryPath: string) => {
    const registry = loadSourceRegistry(registryPath);
    for (const source of registry.github) {
      console.log(
        [
          source.id,
          source.repository,
          source.cause_area,
          source.labels.join(","),
        ].join("\t"),
      );
    }
  });

program
  .command("start")
  .description("Start the human-in-the-loop Spare Tokens agent workflow.")
  .option("-t, --target <target>", "codex, claude, or gemini", "codex")
  .option("--source <id>", "source id from the registry, or all", "all")
  .option("--registry <path>", "source registry YAML path", defaultSourcesPath)
  .option("--out <path>", "local task packet output root", ".spare-tokens/tasks")
  .option("--import-limit <number>", "maximum issues to import per source", "1")
  .option("-l, --limit <number>", "number of ranked tasks to show", "5")
  .option("--cause <cause>", "filter by cause area")
  .option("--max-risk <risk>", "filter by maximum risk: low, medium, or high")
  .option("--no-import", "skip GitHub import and rank existing local or bundled tasks")
  .option("--overwrite", "overwrite existing generated task directories")
  .option("--json", "emit machine-readable JSON")
  .action(
    async (options: {
      target: string;
      source: string;
      registry: string;
      out: string;
      importLimit: string;
      limit: string;
      cause?: string;
      maxRisk?: string;
      import?: boolean;
      overwrite?: boolean;
      json?: boolean;
    }) => {
      const target = parseTarget(options.target);
      const importLimit = parseLimit(options.importLimit);
      const limit = parseLimit(options.limit);
      const causeArea = options.cause ? parseCauseArea(options.cause) : undefined;
      const maxRisk = options.maxRisk ? parseRisk(options.maxRisk) : undefined;

      let written = 0;
      let skipped = 0;
      const warnings: string[] = [];
      if (options.import !== false) {
        const sources = selectGitHubSources(
          loadSourceRegistry(options.registry),
          options.source,
        );
        const generated = await fetchIssuesForSources(sources, {
          limitPerSource: importLimit,
          token: process.env.GITHUB_TOKEN,
          continueOnError: true,
          onWarning: (message) => warnings.push(message),
        });
        const results = writeGeneratedTasks(generated, options.out, {
          overwrite: Boolean(options.overwrite),
        });
        written = results.filter((result) => result.written).length;
        skipped = results.filter((result) => result.skipped).length;
      }

      let taskRoot = existsSync(options.out) ? options.out : defaultTasksPath;
      let tasks = loadValidTasks(taskRoot);
      if (tasks.length === 0 && taskRoot !== defaultTasksPath) {
        taskRoot = defaultTasksPath;
        tasks = loadValidTasks(taskRoot);
      }
      const ranked = rankOpenTasks(tasks, { causeArea, maxRisk });
      if (ranked.length === 0) {
        throw new Error("No open tasks matched the start workflow filters.");
      }
      const top = ranked.slice(0, limit);

      if (options.json) {
        console.log(
          JSON.stringify(
            {
              target,
              task_root: taskRoot,
              imported: { written, skipped, warnings },
              tasks: top.map(summarizeRankedTask),
              select_command: `${selectionCommandBase(taskRoot)} pick ${taskRoot} --target ${target} --select <rank-or-task-id>`,
            },
            null,
            2,
          ),
        );
        return;
      }

      console.log(
        formatStartOutput({
          target,
          taskRoot,
          limit,
          written,
          skipped,
          warnings,
          ranked: top,
        }),
      );
    },
  );

const ingest = program.command("ingest").description("Import external public-good tasks.");

ingest
  .command("github")
  .description("Import maintainer-labeled public GitHub issues as task packets.")
  .argument("[registry]", "source registry YAML path", defaultSourcesPath)
  .option("--source <id>", "source id from the registry, or all", "all")
  .option("--repo <owner/repo>", "ad hoc GitHub repository to import from")
  .option("--labels <labels>", "comma-separated labels for --repo", "good first issue,help wanted")
  .option("--cause <cause>", "cause area for --repo imports", "oss-infrastructure")
  .option("--project-name <name>", "project name for --repo imports")
  .option("--project-url <url>", "project URL for --repo imports")
  .option("--limit <number>", "maximum issues to import per source", "2")
  .option("--out <path>", "task packet output root", "tasks")
  .option("--dry-run", "print candidate task ids without writing files")
  .option("--overwrite", "overwrite existing generated task directories")
  .action(
    async (
      registryPath: string,
      options: {
        source: string;
        repo?: string;
        labels: string;
        cause: string;
        projectName?: string;
        projectUrl?: string;
        limit: string;
        out: string;
        dryRun?: boolean;
        overwrite?: boolean;
      },
    ) => {
      const limitPerSource = parseLimit(options.limit);
      const sources = options.repo
        ? [buildAdHocGitHubSource(options)]
        : selectGitHubSources(loadSourceRegistry(registryPath), options.source);
      const generated = await fetchIssuesForSources(sources, {
        limitPerSource,
        token: process.env.GITHUB_TOKEN,
        continueOnError: true,
        onWarning: (message) => console.error(`[WARN] ${message}`),
      });

      if (generated.length === 0) {
        console.log("No matching open GitHub issues found.");
        return;
      }

      if (options.dryRun) {
        for (const task of generated) {
          console.log(
            `${task.id}\t${task.source.repository}#${task.issue.number}\t${task.issue.title}`,
          );
        }
        return;
      }

      const results = writeGeneratedTasks(generated, options.out, {
        overwrite: Boolean(options.overwrite),
      });
      for (const result of results) {
        const status = result.skipped ? "SKIP" : "WRITE";
        console.log(
          `[${status}] ${result.task.id} (${result.task.source.repository}#${result.task.issue.number})`,
        );
      }
      const written = results.filter((result) => result.written).length;
      const skipped = results.filter((result) => result.skipped).length;
      console.log(
        `Imported ${written} GitHub issue task(s); skipped ${skipped} existing task(s).`,
      );
    },
  );

program
  .command("pick")
  .description("Rank open tasks and export a selected prompt.")
  .argument("[path]", "tasks root", defaultTasksPath)
  .option("-t, --target <target>", "codex, claude, or gemini", "codex")
  .option("-l, --limit <number>", "number of open tasks to show", "5")
  .option("-s, --select <selection>", "rank number or task id to export")
  .option("--cause <cause>", "filter by cause area")
  .option("--max-risk <risk>", "filter by maximum risk: low, medium, or high")
  .option("--json", "emit machine-readable JSON")
  .action(
    (
      inputPath: string,
      options: {
        target: string;
        limit: string;
        select?: string;
        cause?: string;
        maxRisk?: string;
        json?: boolean;
      },
    ) => {
      const target = parseTarget(options.target);
      const limit = parseLimit(options.limit);
      const causeArea = options.cause ? parseCauseArea(options.cause) : undefined;
      const maxRisk = options.maxRisk ? parseRisk(options.maxRisk) : undefined;
      const tasks = loadValidTasks(inputPath);
      const ranked = rankOpenTasks(tasks, { causeArea, maxRisk });

      if (ranked.length === 0) {
        throw new Error("No open tasks matched the picker filters.");
      }

      if (options.select) {
        const selection = resolveRankedSelection(ranked, options.select);
        if (!selection) {
          throw new Error(`Selection not found among open tasks: ${options.select}`);
        }
        const prompt = exportPrompt(selection.task, target);
        if (options.json) {
          console.log(
            JSON.stringify(
              {
                target,
                selected: summarizeRankedTask(selection),
                prompt,
              },
              null,
              2,
            ),
          );
          return;
        }
        console.log(prompt);
        return;
      }

      const top = ranked.slice(0, limit);
      if (options.json) {
        console.log(
          JSON.stringify(
            {
              target,
              tasks: top.map(summarizeRankedTask),
            },
            null,
            2,
          ),
        );
        return;
      }

      console.log(
        formatPickList(top, {
          target,
          limit,
          commandName: shouldShowPathArgument(inputPath)
            ? "spare"
            : "npx spare-tokens@latest",
          pathArgument: shouldShowPathArgument(inputPath) ? inputPath : undefined,
        }),
      );
    },
  );

await program.parseAsync();

function parseTarget(value: string): PromptTarget {
  if (value === "codex" || value === "claude" || value === "gemini") {
    return value;
  }
  throw new Error(`Unknown target: ${value}`);
}

function parseCauseArea(value: string) {
  const result = CauseAreaSchema.safeParse(value);
  if (!result.success) {
    throw new Error(`Unknown cause area: ${value}`);
  }
  return result.data;
}

function parseRisk(value: string) {
  const result = RiskLevelSchema.safeParse(value);
  if (!result.success) {
    throw new Error(`Unknown risk level: ${value}`);
  }
  return result.data;
}

function parseLimit(value: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 50) {
    throw new Error(`Limit must be an integer from 1 to 50: ${value}`);
  }
  return parsed;
}

function buildAdHocGitHubSource(options: {
  repo?: string;
  labels: string;
  cause: string;
  projectName?: string;
  projectUrl?: string;
}): GitHubIssueSource {
  if (!options.repo) {
    throw new Error("--repo is required for ad hoc GitHub imports.");
  }
  const cause = parseCauseArea(options.cause);
  const labels = options.labels
    .split(",")
    .map((label) => label.trim())
    .filter(Boolean);
  if (labels.length === 0) {
    throw new Error("--labels must include at least one label.");
  }

  return GitHubIssueSourceSchema.parse({
    id: `adhoc-${options.repo.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`,
    repository: options.repo,
    project_name: options.projectName ?? options.repo,
    project_url: options.projectUrl ?? `https://github.com/${options.repo}`,
    cause_area: cause,
    labels,
    importance:
      "This ad hoc GitHub import targets an open-source project selected by the user for public-good contribution.",
    beneficiaries: ["maintainers", "users"],
  });
}

function formatStartOutput(options: {
  target: PromptTarget;
  taskRoot: string;
  limit: number;
  written: number;
  skipped: number;
  warnings: string[];
  ranked: ReturnType<typeof rankOpenTasks>;
}): string {
  const lines = [
    "Spare Tokens v0.7 agent workflow",
    "",
    `Task root: ${options.taskRoot}`,
    `Imported: ${options.written} new, ${options.skipped} existing`,
  ];

  if (options.warnings.length > 0) {
    lines.push("", "Warnings:");
    for (const warning of options.warnings) {
      lines.push(`- ${warning}`);
    }
  }

  lines.push(
    "",
    formatPickList(options.ranked, {
      target: options.target,
      limit: options.limit,
      commandName: selectionCommandBase(options.taskRoot),
      pathArgument: options.taskRoot,
    }),
    "",
    "After the user picks a task, export the selected prompt and execute it end to end:",
    "- re-check the upstream issue",
    "- clone or open the upstream repo",
    "- make the smallest useful change",
    "- run targeted tests or docs checks",
    "- run the adversarial review checklist",
    "- prepare PR title/body",
    "- ask before pushing or opening the PR unless the user already approved PR submission for that selected task",
  );

  return lines.join("\n");
}

function selectionCommandBase(taskRoot: string): string {
  return "npx spare-tokens@latest";
}

function resolveTaskInput(input: string): string {
  const explicitPath = resolve(input);
  if (existsSync(explicitPath)) {
    return explicitPath;
  }

  const bundledTaskPath = join(defaultTasksPath, input);
  if (existsSync(bundledTaskPath)) {
    return bundledTaskPath;
  }

  throw new Error(`Task path or bundled task id not found: ${input}`);
}

function shouldShowPathArgument(inputPath: string): boolean {
  return resolve(inputPath) !== resolve(defaultTasksPath);
}

function packageRoot(): string {
  return dirname(dirname(fileURLToPath(import.meta.url)));
}
