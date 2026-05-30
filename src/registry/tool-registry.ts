import type { ToolDefinition } from "../core/types.js";
import { runContentMultiplier } from "../tools/content-multiplier.js";
import { runGitHubScout } from "../tools/github-scout.js";
import { runPromptGenerator } from "../tools/prompt-generator.js";

export const toolRegistry: ToolDefinition[] = [
  {
    id: "content-multiplier",
    name: "Content Multiplier",
    status: "mvp",
    summary: "Verwandelt Quellen in wiederverwendbare Entwuerfe fuer mehrere Plattformen.",
    categories: ["content", "marketing", "seo"],
    commands: [
      {
        name: "analyze-url",
        summary: "Liest eine URL an und erstellt einen kompakten Analysebericht.",
        example: "pnpm ai-content analyze-url https://example.com",
      },
      {
        name: "multiply",
        summary: "Wandelt eine Datei oder Rohtext in mehrere Ausgabeformate um.",
        example: "pnpm ai-content multiply examples/input/sample-source.md",
      },
    ],
    run: runContentMultiplier,
  },
  {
    id: "reverse-engineer",
    name: "Content Reverse Engineer",
    status: "planned",
    summary: "Zerlegt erfolgreiche Inhalte in Hooks, Struktur und wiederverwendbare Muster.",
    categories: ["content", "analysis"],
    commands: [
      {
        name: "reverse",
        summary: "Analysiert ein Transkript oder einen Post auf wiederverwendbare Erfolgsfaktoren.",
        example: "pnpm ai-content reverse transcript.md",
      },
    ],
    roadmap: [
      "Hook- und CTA-Extraktion",
      "Zielgruppen- und Emotions-Mapping",
      "Bewertung wiederverwendbarer Muster",
    ],
  },
  {
    id: "research-agent",
    name: "AI Research Agent",
    status: "planned",
    summary: "Erstellt quellenbasierte Rechercheberichte aus lokalen und externen Materialien.",
    categories: ["research", "analysis"],
    commands: [
      {
        name: "research",
        summary: "Sammelt Quellen und erzeugt einen Bericht mit Empfehlungen.",
        example: "pnpm ai-content research docs/topic.md",
      },
    ],
  },
  {
    id: "github-scout",
    name: "GitHub Scout",
    status: "mvp",
    summary: "Analysiert GitHub-Repositories auf Projektzustand und Integrationspotenzial.",
    categories: ["github", "research", "open-source"],
    commands: [
      {
        name: "github",
        summary: "Analysiert eine GitHub-URL oder owner/repo-Referenz.",
        example: "pnpm ai-content github https://github.com/openai/openai-cookbook",
      },
    ],
    run: runGitHubScout,
  },
  {
    id: "clone-finder",
    name: "Open Source Clone Finder",
    status: "planned",
    summary: "Findet Alternativen, Forks und lizenzrelevante Clone-Landschaften.",
    categories: ["open-source", "research"],
    commands: [
      {
        name: "clone-find",
        summary: "Sucht nach vergleichbaren Open-Source-Tools.",
        example: "pnpm ai-content clone-find notion",
      },
    ],
  },
  {
    id: "project-architect",
    name: "Project Architect",
    status: "planned",
    summary: "Uebersetzt eine Idee in Architektur, Roadmap und umsetzbare Arbeitspakete.",
    categories: ["planning", "architecture"],
    commands: [
      {
        name: "architect",
        summary: "Erzeugt Projektarchitektur und MVP-Leitplanken.",
        example: "pnpm ai-content architect \"Lokales KI-Dashboard fuer Creator\"",
      },
    ],
  },
  {
    id: "prompt-generator",
    name: "Prompt Generator Pro",
    status: "mvp",
    summary: "Erzeugt Prompt-Pakete inklusive Modell-Empfehlungen.",
    categories: ["prompting", "creative", "models"],
    commands: [
      {
        name: "prompt",
        summary: "Erstellt aus einer kurzen Anfrage ein strukturiertes Prompt-Bundle.",
        example: "pnpm ai-content prompt \"Erstelle ein Celtic-Trance-Musikvideo\"",
      },
    ],
    run: runPromptGenerator,
  },
  {
    id: "video-factory",
    name: "Video Factory",
    status: "planned",
    summary: "Erstellt Storyboards, Prompt-Ketten und assets fuer Kurzvideo-Workflows.",
    categories: ["video", "creative"],
    commands: [
      {
        name: "video",
        summary: "Erzeugt einen Produktionsplan fuer Kurzvideo-Inhalte.",
        example: "pnpm ai-content video \"Ein Synthwave-Produktlaunch als Short\"",
      },
    ],
  },
  {
    id: "social-publisher",
    name: "Social Publisher",
    status: "planned",
    summary: "Bereitet human-approved Posting-Entwuerfe fuer offizielle Social-APIs vor.",
    categories: ["social", "automation", "publishing"],
    commands: [
      {
        name: "social",
        summary: "Beschreibt den geplanten Ablauf fuer Connect, Draft, Scheduling und Publishing.",
        example: "pnpm ai-content social",
      },
    ],
    roadmap: [
      "OAuth-Kontoverbindung mit verschluesselter Token-Ablage",
      "Validierung von Medien, Captions, Hashtags und Richtlinienrisiken",
      "Menschliche Freigabe vor offiziellem API-Publishing oder Scheduling",
    ],
  },
  {
    id: "ki-job-queue-manager",
    name: "KI Job Queue Manager",
    status: "planned",
    summary: "Steuert lokale KI-Auftraege kontrolliert und schuetzt das System vor Ueberlastung.",
    categories: ["queue", "automation", "system"],
    commands: [
      {
        name: "queue-manager",
        summary: "Zeigt den geplanten Funktionsumfang des lokalen Warteschlangen-Managers.",
        example: "pnpm ai-content queue-manager",
      },
    ],
    roadmap: [
      "Persistente Queue auf JSONL-Basis",
      "Worker-Loop mit CPU-, RAM-, GPU- und Speicherpruefung",
      "Wrapper fuer Codex, OpenClaw, Ollama, n8n und Shell-Jobs",
    ],
  },
  {
    id: "knowledge-base",
    name: "Self Learning Knowledge Base",
    status: "planned",
    summary: "Speichert Markdown, Transkripte und RAG-taugliche lokale Wissensbausteine.",
    categories: ["knowledge", "rag", "storage"],
    commands: [
      {
        name: "knowledge",
        summary: "Importiert und normalisiert lokale Wissensartefakte.",
        example: "pnpm ai-content knowledge import examples/input/sample-source.md",
      },
    ],
  },
  {
    id: "workflow-exporter",
    name: "Workflow Exporter",
    status: "planned",
    summary: "Exportiert Ergebnisse in Automationen, Markdown und Office-nahe Formate.",
    categories: ["workflows", "automation", "exports"],
    commands: [
      {
        name: "export",
        summary: "Exportiert Berichte in strukturierte Integrationsziele.",
        example: "pnpm ai-content export report.json --target n8n",
      },
    ],
  },
];

export function findToolForCommand(command: string): ToolDefinition | undefined {
  return toolRegistry.find((tool) =>
    tool.commands.some((toolCommand) => toolCommand.name === command),
  );
}
