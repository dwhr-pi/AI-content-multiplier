import { getFlagString, trimWords } from "../core/utils.js";
import type { CliCommandResult, CommandContext, ParsedArgs } from "../core/types.js";

interface ModelSuggestion {
  id: string;
  provider: string;
  bestFor: string;
  cost: "niedrig" | "mittel" | "hoch";
}

const MODEL_MAP: Record<string, ModelSuggestion[]> = {
  text: [
    { id: "gpt-4.1-mini", provider: "OpenAI", bestFor: "Schnelles strukturiertes Schreiben", cost: "mittel" },
    { id: "claude-3-5-sonnet", provider: "Anthropic", bestFor: "Laengere Entwuerfe und Begruendungen", cost: "hoch" },
    { id: "llama3.2:latest", provider: "Ollama", bestFor: "Lokale Iteration", cost: "niedrig" },
  ],
  image: [
    { id: "flux", provider: "Flux", bestFor: "Detailliertes Bild-Prompting", cost: "mittel" },
    { id: "stable-diffusion-xl", provider: "Stable Diffusion", bestFor: "Lokale Bild-Workflows", cost: "niedrig" },
    { id: "comfyui", provider: "ComfyUI", bestFor: "Node-basierte Prompt-Pipelines", cost: "niedrig" },
  ],
  music: [
    { id: "suno", provider: "Suno", bestFor: "Lyrics-to-Song-Workflows", cost: "mittel" },
    { id: "udio", provider: "Udio", bestFor: "Genre- und stimmungsreiche Song-Generierung", cost: "mittel" },
    { id: "llama3.2:latest", provider: "Ollama", bestFor: "Lokale Text- und Strukturplanung", cost: "niedrig" },
  ],
  video: [
    { id: "veo", provider: "Google", bestFor: "Cineastisches Video-Prompting", cost: "hoch" },
    { id: "kling", provider: "Kling", bestFor: "Kurzformatige Motion-Prompts", cost: "hoch" },
    { id: "runway", provider: "Runway", bestFor: "Verfeinerung von Storyboard zu Video", cost: "hoch" },
  ],
};

function detectFamily(brief: string): keyof typeof MODEL_MAP {
  const lowered = brief.toLowerCase();

  if (/(song|music|lyrics|suno|udio)/.test(lowered)) {
    return "music";
  }

  if (/(image|poster|illustration|cover|photo|flux|stable diffusion|comfy)/.test(lowered)) {
    return "image";
  }

  if (/(video|reel|short|scene|storyboard|sora|veo|kling|runway|hailuo)/.test(lowered)) {
    return "video";
  }

  return "text";
}

function renderPromptBundle(
  brief: string,
  family: keyof typeof MODEL_MAP,
  target: string,
  models: ModelSuggestion[],
): Record<string, unknown> {
  const baseGoal = trimWords(brief, 32);
  const prompt = [
    `Rolle: Senior-KI-Produktionsassistenz fuer ${target}.`,
    `Ziel: ${baseGoal}`,
    `Anforderungen:`,
    `- Die Hauptintention und Zielgruppe erhalten.`,
    `- Einen sauberen Erstentwurf plus eine staerkere Alternative liefern.`,
    `- Annahmen, fehlende Daten und Risikohinweise explizit nennen.`,
    `- Das Ergebnis in einer wiederverwendbaren Markdown-Struktur zurueckgeben.`,
  ].join("\n");

  const outputFormat =
    family === "video"
      ? "Abschnitte: Konzept, Storyboard, Shot-Liste, Bild-Prompts, Motion-Prompts, Posting-Text."
      : family === "music"
        ? "Abschnitte: Konzept, Songtext, Klangreferenzen, Arrangement-Notizen, Cover-Prompt, Social-Teaser."
        : family === "image"
          ? "Abschnitte: Konzept, Bild-Prompt, Negativ-Prompt, Stilmodifikatoren, Export-Einstellungen."
          : "Abschnitte: Kontext, System-Prompt, User-Prompt, Checkliste, Alternativversion.";

  return {
    family,
    target,
    recommendations: models,
    prompt,
    outputFormat,
    notes: [
      "Ollama verwenden, wenn Datenschutz wichtiger ist als maximale Ausarbeitung.",
      "Ein Cloud-Modell nur nutzen, wenn der API-Key bewusst hinterlegt wurde.",
      "Faktische Aussagen vor der finalen Nutzung validieren.",
    ],
  };
}

function renderMarkdown(result: Record<string, unknown>): string {
  const recommendations = result.recommendations as ModelSuggestion[];
  const notes = result.notes as string[];

  return [
    `# Prompt-Generator-Bericht`,
    ``,
    `- Ziel: ${result.target as string}`,
    `- Familie: ${result.family as string}`,
    ``,
    `## Empfohlene Modelle`,
    ...recommendations.map(
      (model) =>
        `- ${model.id} (${model.provider}) - ${model.bestFor} - Kosten: ${model.cost}`,
    ),
    ``,
    `## Produktions-Prompt`,
    "```text",
    result.prompt as string,
    "```",
    ``,
    `## Erwartetes Ausgabeformat`,
    result.outputFormat as string,
    ``,
    `## Hinweise`,
    ...notes.map((note) => `- ${note}`),
  ].join("\n");
}

export async function runPromptGenerator(
  _action: string,
  args: ParsedArgs,
  _context: CommandContext,
): Promise<CliCommandResult> {
  const brief = args.positional.join(" ").trim() || getFlagString(args.flags, "brief");
  if (!brief) {
    throw new Error("Prompt-Beschreibung fehlt. Bitte eine kurze kreative oder technische Anfrage angeben.");
  }

  const target = getFlagString(args.flags, "target", "allgemein");
  const family = detectFamily(brief);
  const recommendations = MODEL_MAP[family];
  const data = renderPromptBundle(brief, family, target, recommendations);

  return {
    data,
    markdown: renderMarkdown(data),
  };
}
