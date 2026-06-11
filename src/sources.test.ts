import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadSourceRegistry, selectGitHubSources } from "./sources.js";

describe("source registry", () => {
  it("loads curated GitHub sources from YAML", () => {
    const dir = mkdtempSync(join(tmpdir(), "spare-sources-"));
    const path = join(dir, "sources.yaml");
    writeFileSync(
      path,
      [
        'schema_version: "0.1"',
        "github:",
        "  - id: example-source",
        "    repository: example/project",
        "    project_name: Example Project",
        "    project_url: https://example.com",
        "    cause_area: science",
        "    labels:",
        "      - help wanted",
        "    importance: This project is useful public infrastructure for tests.",
        "    beneficiaries:",
        "      - maintainers",
      ].join("\n"),
    );

    const registry = loadSourceRegistry(path);

    expect(registry.github[0].id).toBe("example-source");
    expect(registry.github[0].task_type).toBe("issue-triage");
    expect(registry.github[0].labels).toEqual(["help wanted"]);
  });

  it("selects one source or every source", () => {
    const registry = {
      schema_version: "0.1" as const,
      github: [
        {
          id: "first",
          repository: "example/first",
          project_name: "First",
          project_url: "https://example.com/first",
          cause_area: "science" as const,
          labels: ["help wanted"],
          task_type: "issue-triage" as const,
          difficulty: "medium" as const,
          estimated_minutes: 60,
          human_minutes: 15,
          risk_level: "low" as const,
          pr_policy: "do-not-open-pr" as const,
          importance: "This project has public-good value for testing.",
          tractability: "Maintainer labels make this bounded enough for testing.",
          neglectedness: "Small issues can remain unattempted without help.",
          beneficiaries: ["maintainers"],
          allowed_actions: ["read public issue text"],
          expected_outputs: ["triage artifact"],
        },
        {
          id: "second",
          repository: "example/second",
          project_name: "Second",
          project_url: "https://example.com/second",
          cause_area: "civic-tech" as const,
          labels: ["good first issue"],
          task_type: "docs-fix" as const,
          difficulty: "low" as const,
          estimated_minutes: 45,
          human_minutes: 10,
          risk_level: "low" as const,
          pr_policy: "do-not-open-pr" as const,
          importance: "This project has public-good value for testing.",
          tractability: "Maintainer labels make this bounded enough for testing.",
          neglectedness: "Small issues can remain unattempted without help.",
          beneficiaries: ["maintainers"],
          allowed_actions: ["read public issue text"],
          expected_outputs: ["triage artifact"],
        },
      ],
    };

    expect(selectGitHubSources(registry, "second").map((source) => source.id)).toEqual([
      "second",
    ]);
    expect(selectGitHubSources(registry, "all")).toHaveLength(2);
  });
});
