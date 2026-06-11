import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { LoadedTask } from "./tasks.js";

export function renderCatalog(tasks: LoadedTask[]): string {
  const causeAreas = [...new Set(tasks.map((task) => task.packet.cause_area))];
  const cards = tasks
    .map((task) => {
      const p = task.packet;
      const sources = p.sources
        .map((source) => `<a href="${escapeHtml(source.url)}">${escapeHtml(source.label)}</a>`)
        .join(", ");

      return `
        <article class="task-card">
          <div class="meta">
            <span>${escapeHtml(formatLabel(p.cause_area))}</span>
            <span>${escapeHtml(formatLabel(p.task.type))}</span>
            <span>${p.task.estimated_minutes} min</span>
          </div>
          <h2>${escapeHtml(p.title)}</h2>
          <p>${escapeHtml(p.summary)}</p>
          <dl class="task-details">
            <dt>Impact</dt>
            <dd>${escapeHtml(p.impact.importance)}</dd>
            <dt>Verification</dt>
            <dd><strong>${p.verification.human_minutes} min review</strong> with ${escapeHtml(p.verification.evidence_required.join("; "))}</dd>
            <dt>Output</dt>
            <dd>${escapeHtml(p.task.expected_outputs.join(", "))}</dd>
            <dt>PR policy</dt>
            <dd>${escapeHtml(formatLabel(p.task.pr_policy))}</dd>
            <dt>Risk</dt>
            <dd>${escapeHtml(formatLabel(p.risk.level))}: ${escapeHtml(p.risk.notes)}</dd>
            ${sources ? `<dt>Sources</dt><dd>${sources}</dd>` : ""}
          </dl>
        </article>
      `;
    })
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Spare Tokens</title>
  <style>
    /* Visual tokens mirror the Calibrating Posteriors BRAND_GUIDE.md dark blueprint mode. */
    :root {
      color-scheme: dark;
      --bg: #0d1b2a;
      --surface: #142640;
      --surface-2: #1a2d52;
      --edge: #1e3158;
      --edge-strong: #2a3f66;
      --ink: #e8e8e8;
      --ink-soft: #a8b8d9;
      --ink-muted: #64748b;
      --navy-light: #3d5a9c;
      --navy-lighter: #7894c5;
      --amber: #f5a623;
      --radius: 8px;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Satoshi, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background:
        linear-gradient(rgba(120, 148, 197, 0.035) 1px, transparent 1px),
        linear-gradient(90deg, rgba(120, 148, 197, 0.035) 1px, transparent 1px),
        var(--bg);
      background-size: 32px 32px;
      color: var(--ink);
      line-height: 1.5;
    }
    header {
      border-bottom: 1px solid var(--edge);
      padding: 44px 24px 30px;
    }
    main, .inner, .criteria-inner {
      width: min(1120px, calc(100vw - 32px));
      margin: 0 auto;
    }
    .eyebrow {
      color: var(--amber);
      font-family: "Space Grotesk", ui-sans-serif, system-ui, sans-serif;
      font-size: 12px;
      letter-spacing: 0;
      margin: 0 0 10px;
      text-transform: uppercase;
    }
    h1 {
      font-family: "Space Grotesk", ui-sans-serif, system-ui, sans-serif;
      font-size: clamp(34px, 5vw, 60px);
      font-weight: 500;
      line-height: 1;
      margin: 0 0 14px;
      letter-spacing: 0;
    }
    .tagline {
      max-width: 820px;
      margin: 0;
      color: var(--ink-soft);
      font-size: 18px;
    }
    .measurement {
      background: var(--amber);
      height: 3px;
      margin: 26px 0 0;
      width: min(280px, 55vw);
    }
    .stats {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 22px;
    }
    .pill {
      border: 1px solid var(--edge-strong);
      padding: 6px 10px;
      border-radius: var(--radius);
      color: var(--ink-soft);
      font-size: 13px;
      background: rgba(20, 38, 64, 0.72);
    }
    .criteria {
      border-bottom: 1px solid var(--edge);
      background: rgba(20, 38, 64, 0.42);
      padding: 20px 0;
    }
    .criteria-inner {
      display: grid;
      grid-template-columns: 1.1fr 2fr;
      gap: 20px;
      align-items: start;
    }
    .criteria h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
    }
    .criteria-list {
      display: grid;
      gap: 10px;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      margin: 0;
    }
    .criterion {
      border-left: 2px solid var(--edge-strong);
      color: var(--ink-soft);
      padding-left: 12px;
    }
    .criterion strong {
      color: var(--ink);
      display: block;
      font-family: "Space Grotesk", ui-sans-serif, system-ui, sans-serif;
      font-weight: 500;
      margin-bottom: 2px;
    }
    main {
      padding: 28px 0 56px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }
    .task-card {
      background: rgba(20, 38, 64, 0.94);
      border: 1px solid var(--edge);
      border-radius: var(--radius);
      padding: 18px;
      box-shadow: 0 18px 40px rgba(3, 8, 18, 0.18);
    }
    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
      color: var(--navy-lighter);
      font-size: 12px;
      font-family: "Space Grotesk", ui-sans-serif, system-ui, sans-serif;
      font-weight: 500;
      text-transform: uppercase;
    }
    .meta span {
      border: 1px solid var(--edge-strong);
      border-radius: 6px;
      padding: 3px 6px;
    }
    h2 {
      font-family: "Space Grotesk", ui-sans-serif, system-ui, sans-serif;
      margin: 0 0 8px;
      font-size: 20px;
      font-weight: 500;
      letter-spacing: 0;
    }
    p {
      color: var(--ink-soft);
      margin: 0 0 16px;
    }
    .task-details {
      margin: 0;
      display: grid;
      gap: 7px;
    }
    dt {
      color: var(--ink);
      font-family: "Space Grotesk", ui-sans-serif, system-ui, sans-serif;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }
    dd {
      margin: -5px 0 5px;
      color: var(--ink-soft);
    }
    strong {
      color: var(--amber);
      font-weight: 500;
    }
    a {
      color: var(--amber);
      text-underline-offset: 3px;
    }
    @media (max-width: 760px) {
      .criteria-inner,
      .criteria-list {
        grid-template-columns: 1fr;
      }
      header {
        padding-top: 34px;
      }
    }
  </style>
</head>
<body>
  <header>
    <div class="inner">
      <p class="eyebrow">Effective altruist task packets for AI agents</p>
      <h1>Spare Tokens</h1>
      <p class="tagline">AI-ready public-good tasks for spare model quota. Built around impact, tractability, and fast human verification.</p>
      <div class="measurement" aria-hidden="true"></div>
      <div class="stats">
        <span class="pill">${tasks.length} tasks</span>
        <span class="pill">${causeAreas.map(formatLabel).join(" / ")}</span>
        <span class="pill">Artifact-first</span>
        <span class="pill">Human-verifiable</span>
      </div>
    </div>
  </header>
  <section class="criteria" aria-labelledby="criteria-title">
    <div class="criteria-inner">
      <h2 id="criteria-title">Seed Task Criteria</h2>
      <dl class="criteria-list">
        <div class="criterion">
          <dt><strong>Public-good upside</strong></dt>
          <dd>Useful to civic, science, health, or open-source infrastructure users.</dd>
        </div>
        <div class="criterion">
          <dt><strong>AI-tractable surface</strong></dt>
          <dd>Research, repros, docs, accessibility, or triage work with clear boundaries.</dd>
        </div>
        <div class="criterion">
          <dt><strong>Cheap human verification</strong></dt>
          <dd>Evidence can be reviewed in roughly 10 to 15 minutes by a human.</dd>
        </div>
        <div class="criterion">
          <dt><strong>Low maintainer burden</strong></dt>
          <dd>Default output is a reviewable artifact, not unsolicited automated PR spam.</dd>
        </div>
      </dl>
    </div>
  </section>
  <main>
    ${cards}
  </main>
</body>
</html>
`;
}

export function writeCatalog(tasks: LoadedTask[], outPath: string): void {
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, renderCatalog(tasks), "utf8");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatLabel(value: string): string {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
