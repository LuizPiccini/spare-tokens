import { PromptTarget } from "./schema.js";
import { LoadedTask, readTaskFile } from "./tasks.js";

export function exportPrompt(task: LoadedTask, target: PromptTarget): string {
  const promptPath = task.packet.files.prompts[target];
  const prompt = readTaskFile(task, promptPath).trim();
  const context = readTaskFile(task, task.packet.files.context).trim();
  const verify = readTaskFile(task, task.packet.files.verification).trim();

  return [
    `# Spare Tokens Task: ${task.packet.title}`,
    "",
    `Task ID: ${task.packet.id}`,
    `Cause area: ${task.packet.cause_area}`,
    `Project: ${task.packet.project.name} (${task.packet.project.url})`,
    `PR policy: ${task.packet.task.pr_policy}`,
    "",
    "## Agent Prompt",
    prompt,
    "",
    "## Context",
    context,
    "",
    "## Verification",
    verify,
    "",
    "## Required Output",
    task.packet.task.expected_outputs.map((output) => `- ${output}`).join("\n"),
  ].join("\n");
}

