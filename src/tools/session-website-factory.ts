import type { CliCommandResult, CommandContext, ParsedArgs } from "../core/types.js";

export async function runSessionWebsiteFactory(
  _action: string,
  _args: ParsedArgs,
  _context: CommandContext,
): Promise<CliCommandResult> {
  const data = {
    tool: "session-website-factory",
    status: "mvp",
    location: "tools/session-website-factory",
    cli: ["swf new", "swf build", "swf preview", "swf fix", "swf export"],
    defaults: {
      provider: "ollama",
      model: "qwen2.5-coder:latest",
      template: "astro-landingpage",
    },
    rules: [
      "Keine Claude- oder Anthropic-Abhaengigkeit.",
      "Ollama ist der lokale Standardpfad.",
      "OpenClaw, OpenAI und Gemini bleiben optional.",
    ],
  };

  return {
    data,
    markdown: [
      "# SessionWebsiteFactory",
      "",
      "Lokales Tool fuer Website-, Landingpage- und Web-App-Prototypen ohne Claude-Abhaengigkeit.",
      "",
      "- Ort: `tools/session-website-factory/`",
      "- Standard-Backend: `ollama` mit `qwen2.5-coder:latest`",
      "- CLI: `swf new`, `swf build`, `swf preview`, `swf fix`, `swf export`",
      "",
      "Schnellstart:",
      "```bash",
      "cd tools/session-website-factory",
      "pnpm install",
      "pnpm build",
      "pnpm swf new \"Landingpage fuer lokales KI-Produkt\"",
      "pnpm swf build",
      "```",
    ].join("\n"),
  };
}
