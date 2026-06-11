import { PromptTarget, TaskPacket } from "./schema.js";
import { LoadedTask } from "./tasks.js";

export type RankedTask = {
  rank: number;
  score: number;
  reasons: string[];
  task: LoadedTask;
};

export type PickFilters = {
  causeArea?: TaskPacket["cause_area"];
  maxRisk?: TaskPacket["risk"]["level"];
};

const causeScores: Record<TaskPacket["cause_area"], number> = {
  health: 5,
  "civic-tech": 5,
  climate: 5,
  science: 4,
  "oss-infrastructure": 4,
  education: 3,
  other: 2,
};

const difficultyScores: Record<TaskPacket["task"]["difficulty"], number> = {
  low: 3,
  medium: 2,
  high: 0,
};

const riskOrder: Record<TaskPacket["risk"]["level"], number> = {
  low: 0,
  medium: 1,
  high: 2,
};

const riskScores: Record<TaskPacket["risk"]["level"], number> = {
  low: 4,
  medium: 1,
  high: -6,
};

export function rankOpenTasks(
  tasks: LoadedTask[],
  filters: PickFilters = {},
): RankedTask[] {
  const ranked = tasks
    .filter((task) => task.packet.lifecycle.state === "open")
    .filter((task) =>
      filters.causeArea ? task.packet.cause_area === filters.causeArea : true,
    )
    .filter((task) =>
      filters.maxRisk
        ? riskOrder[task.packet.risk.level] <= riskOrder[filters.maxRisk]
        : true,
    )
    .map((task) => {
      const result = scoreTask(task.packet);
      return {
        rank: 0,
        score: result.score,
        reasons: result.reasons,
        task,
      };
    })
    .sort(compareRankedTasks);

  return ranked.map((task, index) => ({ ...task, rank: index + 1 }));
}

export function resolveRankedSelection(
  rankedTasks: RankedTask[],
  selection: string,
): RankedTask | undefined {
  const index = Number(selection);
  if (Number.isInteger(index) && index >= 1) {
    return rankedTasks[index - 1];
  }

  return rankedTasks.find((ranked) => ranked.task.packet.id === selection);
}

export function formatPickList(
  rankedTasks: RankedTask[],
  options: {
    target: PromptTarget;
    limit: number;
    commandName?: string;
    pathArgument?: string;
  },
): string {
  const commandName = options.commandName ?? "spare";
  const path = options.pathArgument ? ` ${formatCommandArg(options.pathArgument)}` : "";
  const rows = rankedTasks.slice(0, options.limit).map((ranked) => {
    const packet = ranked.task.packet;
    const origin =
      packet.origin?.type === "github-issue"
        ? `   Source: GitHub ${packet.origin.repository}#${packet.origin.issue_number}`
        : undefined;
    return [
      `${ranked.rank}. ${packet.id}`,
      `   ${packet.title}`,
      origin,
      `   Cause: ${formatLabel(packet.cause_area)} | Risk: ${formatLabel(packet.risk.level)} | Agent time: ${packet.task.estimated_minutes} min | Human review: ${packet.verification.human_minutes} min`,
      `   Score: ${ranked.score} | ${ranked.reasons.join("; ")}`,
    ]
      .filter(Boolean)
      .join("\n");
  });

  return [
    `Top ${Math.min(options.limit, rankedTasks.length)} open Spare Tokens tasks`,
    "",
    ...rows,
    "",
    "To export a prompt for a selection:",
    `  ${commandName} pick${path} --target ${options.target} --select 1`,
    `  ${commandName} pick${path} --target ${options.target} --select <task-id>`,
  ].join("\n");
}

export function summarizeRankedTask(ranked: RankedTask): {
  rank: number;
  id: string;
  title: string;
  cause_area: TaskPacket["cause_area"];
  task_type: TaskPacket["task"]["type"];
  risk: TaskPacket["risk"]["level"];
  agent_minutes: number;
  human_minutes: number;
  score: number;
  reasons: string[];
  origin?: TaskPacket["origin"];
} {
  const packet = ranked.task.packet;
  return {
    rank: ranked.rank,
    id: packet.id,
    title: packet.title,
    cause_area: packet.cause_area,
    task_type: packet.task.type,
    risk: packet.risk.level,
    agent_minutes: packet.task.estimated_minutes,
    human_minutes: packet.verification.human_minutes,
    score: ranked.score,
    reasons: ranked.reasons,
    origin: packet.origin,
  };
}

function scoreTask(packet: TaskPacket): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  score += causeScores[packet.cause_area];
  reasons.push(`${formatLabel(packet.cause_area)} public-good area`);

  score += difficultyScores[packet.task.difficulty];
  reasons.push(`${packet.task.difficulty} AI difficulty`);

  const agentMinutes = packet.task.estimated_minutes;
  if (agentMinutes <= 30) {
    score += 3;
    reasons.push("short agent run");
  } else if (agentMinutes <= 60) {
    score += 2;
    reasons.push("bounded agent run");
  } else if (agentMinutes <= 120) {
    score += 1;
    reasons.push("moderate agent run");
  }

  const humanMinutes = packet.verification.human_minutes;
  if (humanMinutes <= 10) {
    score += 4;
    reasons.push("fast human verification");
  } else if (humanMinutes <= 15) {
    score += 3;
    reasons.push("reasonable human verification");
  } else if (humanMinutes <= 30) {
    score += 1;
    reasons.push("moderate human verification");
  }

  score += riskScores[packet.risk.level];
  reasons.push(`${packet.risk.level} risk`);

  if (packet.task.pr_policy === "do-not-open-pr") {
    score += 2;
    reasons.push("artifact-first");
  } else if (packet.task.pr_policy === "allowed-after-human-review") {
    score += 1;
    reasons.push("human review gate");
  }

  if (packet.sources.length > 0) {
    score += 1;
    reasons.push("source-backed");
  }

  if (packet.origin?.type === "github-issue") {
    score += 3;
    reasons.push("maintainer-signaled GitHub issue");
    if (packet.origin.signal_labels.length > 0) {
      score += 2;
      reasons.push(`signal labels: ${packet.origin.signal_labels.join(", ")}`);
    }
    if (hasBroadOrHardLabel(packet.origin.labels)) {
      score -= 6;
      reasons.push("broad or hard upstream label");
    }
  }

  return { score, reasons };
}

function compareRankedTasks(a: RankedTask, b: RankedTask): number {
  return (
    b.score - a.score ||
    a.task.packet.verification.human_minutes - b.task.packet.verification.human_minutes ||
    a.task.packet.task.estimated_minutes - b.task.packet.task.estimated_minutes ||
    a.task.packet.id.localeCompare(b.task.packet.id)
  );
}

function formatLabel(value: string): string {
  return value
    .split("-")
    .map((word) => (word === "oss" ? "OSS" : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(" ");
}

function hasBroadOrHardLabel(labels: string[]): boolean {
  const normalized = labels.map((label) => label.toLowerCase());
  return normalized.some(
    (label) =>
      label === "hard" ||
      label === "meta-issue" ||
      label === "needs design" ||
      label === "needs decision" ||
      label === "blocked",
  );
}

function formatCommandArg(value: string): string {
  return /\s/.test(value) ? `"${value.replaceAll('"', '\\"')}"` : value;
}
