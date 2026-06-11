#!/usr/bin/env node
import { Command } from "commander";
import { writeCatalog } from "./catalog.js";
import { exportPrompt } from "./prompts.js";
import { PromptTarget } from "./schema.js";
import { findTaskYamlPaths, loadValidTasks, validateTask } from "./tasks.js";

const program = new Command();

program
  .name("spare")
  .description("Validate and export AI-ready public-good tasks.")
  .version("0.1.0");

program
  .command("validate")
  .description("Validate one task packet or every task packet under a directory.")
  .argument("[path]", "task directory, task.yaml, or tasks root", "tasks")
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
  .argument("[path]", "tasks root", "tasks")
  .action((inputPath: string) => {
    const tasks = loadValidTasks(inputPath);
    for (const task of tasks) {
      console.log(`${task.packet.id}\t${task.packet.cause_area}\t${task.packet.title}`);
    }
  });

program
  .command("export")
  .description("Export a target-specific prompt for a task packet.")
  .argument("<task>", "task directory or task.yaml")
  .option("-t, --target <target>", "codex, claude, or gemini", "codex")
  .action((taskPath: string, options: { target: string }) => {
    const target = parseTarget(options.target);
    const tasks = loadValidTasks(taskPath);
    if (tasks.length !== 1) {
      throw new Error(`Expected one task, got ${tasks.length}`);
    }
    console.log(exportPrompt(tasks[0], target));
  });

program
  .command("catalog")
  .description("Generate a self-contained static HTML catalog.")
  .argument("[path]", "tasks root", "tasks")
  .option("-o, --out <path>", "output HTML path", "public/index.html")
  .action((inputPath: string, options: { out: string }) => {
    const tasks = loadValidTasks(inputPath);
    writeCatalog(tasks, options.out);
    console.log(`Wrote ${options.out} with ${tasks.length} task(s).`);
  });

program.parse();

function parseTarget(value: string): PromptTarget {
  if (value === "codex" || value === "claude" || value === "gemini") {
    return value;
  }
  throw new Error(`Unknown target: ${value}`);
}

