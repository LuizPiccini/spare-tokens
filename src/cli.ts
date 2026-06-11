#!/usr/bin/env node
import { Command } from "commander";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { writeCatalog } from "./catalog.js";
import {
  formatPickList,
  rankOpenTasks,
  resolveRankedSelection,
  summarizeRankedTask,
} from "./picker.js";
import { exportPrompt } from "./prompts.js";
import { CauseAreaSchema, PromptTarget, RiskLevelSchema } from "./schema.js";
import { findTaskYamlPaths, loadValidTasks, validateTask } from "./tasks.js";

const program = new Command();
const defaultTasksPath = join(packageRoot(), "tasks");

program
  .name("spare")
  .description("Pick, validate, and export AI-ready public-good tasks.")
  .version("0.5.0");

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

program.parse();

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
