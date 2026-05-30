import process from "node:process";

import { getFlagString, parseArgs } from "./core/utils.js";
import type { CliCommandResult, OutputFormat } from "./core/types.js";
import { findToolForCommand, toolRegistry } from "./registry/tool-registry.js";

function renderRegistry(): string {
  const lines = [
    "# AI Content Multiplier CLI",
    "",
    "## Verfuegbare Tools",
  ];

  for (const tool of toolRegistry) {
    lines.push(`- ${tool.name} [${tool.status}] - ${tool.summary}`);
    for (const command of tool.commands) {
      lines.push(`  befehl: ${command.name} - ${command.summary}`);
      lines.push(`  beispiel: ${command.example}`);
    }
  }

  return lines.join("\n");
}

function renderHelp(): string {
  return [
    renderRegistry(),
    "",
    "## Zentrale Befehle",
    "- pnpm ai-content list",
    "- pnpm ai-content doctor",
    "- pnpm ai-content analyze-url https://example.com",
    "- pnpm ai-content multiply examples/input/sample-source.md",
    "- pnpm ai-content github https://github.com/example/repo",
    "- pnpm ai-content prompt \"Erstelle ein Celtic-Trance-Musikvideo\"",
    "",
    "Mit --output json wird eine maschinenlesbare Ausgabe erzeugt.",
  ].join("\n");
}

function renderDoctor(): CliCommandResult {
  return {
    data: {
      toolCount: toolRegistry.length,
      nodeVersion: process.version,
      cwd: process.cwd(),
      timestamp: new Date().toISOString(),
      implementedTools: toolRegistry
        .filter((tool) => tool.status === "mvp")
        .map((tool) => tool.id),
    },
    markdown: [
      "# AI Content Multiplier Diagnose",
      "",
      `- Node.js: ${process.version}`,
      `- Arbeitsverzeichnis: ${process.cwd()}`,
      `- Anzahl Tools: ${toolRegistry.length}`,
      `- Implementierte MVPs: ${toolRegistry.filter((tool) => tool.status === "mvp").map((tool) => tool.id).join(", ")}`,
    ].join("\n"),
  };
}

function emit(result: CliCommandResult, format: OutputFormat): void {
  if (format === "json") {
    process.stdout.write(`${JSON.stringify(result.data, null, 2)}\n`);
    return;
  }

  process.stdout.write(`${result.markdown}\n`);
}

async function main(): Promise<void> {
  const [command = "help", ...rest] = process.argv.slice(2);
  const parsed = parseArgs(rest);
  const format = getFlagString(parsed.flags, "output", "markdown") === "json"
    ? "json"
    : "markdown";

  if (command === "help" || command === "--help" || command === "-h") {
    process.stdout.write(`${renderHelp()}\n`);
    return;
  }

  if (command === "list" || command === "list-tools") {
    process.stdout.write(`${renderRegistry()}\n`);
    return;
  }

  if (command === "doctor") {
    emit(renderDoctor(), format);
    return;
  }

  const tool = findToolForCommand(command);
  if (!tool) {
    throw new Error(`Unbekannter Befehl: ${command}`);
  }

  if (!tool.run) {
    const roadmap = tool.roadmap?.map((item) => `- ${item}`).join("\n") ?? "- Implementierung geplant";
    process.stdout.write(
      [
        `# ${tool.name}`,
        "",
        `${tool.summary}`,
        "",
        `Status: ${tool.status}`,
        "",
        "Roadmap:",
        roadmap,
      ].join("\n") + "\n",
    );
    return;
  }

  const result = await tool.run(command, parsed, {
    cwd: process.cwd(),
    env: process.env,
    format,
    now: new Date().toISOString(),
  });

  emit(result, format);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Fehler: ${message}\n`);
  process.exitCode = 1;
});
