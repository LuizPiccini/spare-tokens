import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import YAML from "yaml";
import { TaskPacket, TaskPacketSchema } from "./schema.js";

export type LoadedTask = {
  dir: string;
  yamlPath: string;
  packet: TaskPacket;
};

export type TaskValidationResult = {
  ok: boolean;
  task?: LoadedTask;
  errors: string[];
};

export function findTaskYamlPaths(inputPath: string): string[] {
  const resolved = resolve(inputPath);
  if (!existsSync(resolved)) {
    throw new Error(`Path does not exist: ${resolved}`);
  }

  const stats = statSync(resolved);
  if (stats.isFile()) {
    if (basename(resolved) !== "task.yaml") {
      throw new Error(`Expected task.yaml, got: ${resolved}`);
    }
    return [resolved];
  }

  const direct = join(resolved, "task.yaml");
  if (existsSync(direct)) {
    return [direct];
  }

  return readdirSync(resolved, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(resolved, entry.name, "task.yaml"))
    .filter((path) => existsSync(path))
    .sort();
}

export function loadTask(yamlPath: string): LoadedTask {
  const raw = readFileSync(yamlPath, "utf8");
  const parsed = YAML.parse(raw);
  const packet = TaskPacketSchema.parse(parsed);
  return {
    dir: dirname(yamlPath),
    yamlPath,
    packet,
  };
}

export function validateTask(yamlPath: string): TaskValidationResult {
  const errors: string[] = [];
  let task: LoadedTask | undefined;

  try {
    task = loadTask(yamlPath);
  } catch (error) {
    return {
      ok: false,
      errors: [`${yamlPath}: ${formatError(error)}`],
    };
  }

  const requiredFiles = [
    task.packet.files.context,
    task.packet.files.verification,
    task.packet.files.prompts.codex,
    task.packet.files.prompts.claude,
    task.packet.files.prompts.gemini,
    ...task.packet.artifacts
      .map((artifact) => artifact.path)
      .filter((path) => !path.startsWith("http://") && !path.startsWith("https://")),
  ];

  for (const filePath of requiredFiles) {
    const fullPath = join(task.dir, filePath);
    if (!existsSync(fullPath)) {
      errors.push(`${task.packet.id}: missing referenced file ${filePath}`);
    }
  }

  if (
    task.packet.task.pr_policy === "maintainer-welcomes-pr" &&
    !task.packet.project.maintainers_contacted
  ) {
    errors.push(
      `${task.packet.id}: maintainer-welcomes-pr requires maintainers_contacted: true`,
    );
  }

  return {
    ok: errors.length === 0,
    task,
    errors,
  };
}

export function loadValidTasks(inputPath: string): LoadedTask[] {
  const results = findTaskYamlPaths(inputPath).map(validateTask);
  const failures = results.filter((result) => !result.ok);
  if (failures.length > 0) {
    const message = failures.flatMap((result) => result.errors).join("\n");
    throw new Error(message);
  }
  return results.map((result) => result.task as LoadedTask);
}

export function readTaskFile(task: LoadedTask, relativePath: string): string {
  return readFileSync(join(task.dir, relativePath), "utf8");
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
