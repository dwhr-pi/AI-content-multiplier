import { getFlagString, trimWords } from "../core/utils.js";
import type { CliCommandResult, CommandContext, ParsedArgs } from "../core/types.js";

interface ModelSuggestion {
  id: string;
  provider: string;
  bestFor: string;
  cost: "low" | "medium" | "high";
}

const MODEL_MAP: Record<string, ModelSuggestion[]> = {
  text: [
    { id: "gpt-4.1-mini", provider: "OpenAI", bestFor: "Fast structured writing", cost: "medium" },
    { id: "claude-3-5-sonnet", provider: "Anthropic", bestFor: "Long-form drafting and reasoning", cost: "high" },
    { id: "llama3.2:latest", provider: "Ollama", bestFor: "Local-first iteration", cost: "low" },
  ],
  image: [
    { id: "flux", provider: "Flux", bestFor: "Detailed image prompting", cost: "medium" },
    { id: "stable-diffusion-xl", provider: "Stable Diffusion", bestFor: "Local image workflows", cost: "low" },
    { id: "comfyui", provider: "ComfyUI", bestFor: "Node-based prompt pipelines", cost: "low" },
  ],
  music: [
    { id: "suno", provider: "Suno", bestFor: "Lyrics-to-song workflows", cost: "medium" },
    { id: "udio", provider: "Udio", bestFor: "Genre- and mood-rich song generation", cost: "medium" },
    { id: "llama3.2:latest", provider: "Ollama", bestFor: "Local lyric and structure planning", cost: "low" },
  ],
  video: [
    { id: "veo", provider: "Google", bestFor: "Cinematic video prompting", cost: "high" },
    { id: "kling", provider: "Kling", bestFor: "Short-form motion prompts", cost: "high" },
    { id: "runway", provider: "Runway", bestFor: "Storyboard-to-video refinement", cost: "high" },
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
    `Role: Senior AI production assistant for ${target}.`,
    `Goal: ${baseGoal}`,
    `Requirements:`,
    `- Preserve the main intent and target audience.`,
    `- Produce a clean first draft plus one stronger alternative.`,
    `- Surface assumptions, missing data, and risk notes explicitly.`,
    `- Return the result in a reusable markdown structure.`,
  ].join("\n");

  const outputFormat =
    family === "video"
      ? "Sections: concept, storyboard, shot list, visual prompts, motion prompts, publish copy."
      : family === "music"
        ? "Sections: concept, lyrics, sonic references, arrangement notes, cover prompt, social teaser."
        : family === "image"
          ? "Sections: concept, image prompt, negative prompt, style modifiers, export settings."
          : "Sections: context, system prompt, user prompt, checklist, alternative version.";

  return {
    family,
    target,
    recommendations: models,
    prompt,
    outputFormat,
    notes: [
      "Use Ollama when privacy matters more than polish.",
      "Use a cloud model only when you intentionally provide the API key.",
      "Validate factual claims before shipping the final artifact.",
    ],
  };
}

function renderMarkdown(result: Record<string, unknown>): string {
  const recommendations = result.recommendations as ModelSuggestion[];
  const notes = result.notes as string[];

  return [
    `# Prompt Generator Report`,
    ``,
    `- Target: ${result.target as string}`,
    `- Family: ${result.family as string}`,
    ``,
    `## Recommended models`,
    ...recommendations.map(
      (model) =>
        `- ${model.id} (${model.provider}) - ${model.bestFor} - cost: ${model.cost}`,
    ),
    ``,
    `## Production prompt`,
    "```text",
    result.prompt as string,
    "```",
    ``,
    `## Expected output format`,
    result.outputFormat as string,
    ``,
    `## Notes`,
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
    throw new Error("Missing prompt brief. Pass a short creative or technical request.");
  }

  const target = getFlagString(args.flags, "target", "general");
  const family = detectFamily(brief);
  const recommendations = MODEL_MAP[family];
  const data = renderPromptBundle(brief, family, target, recommendations);

  return {
    data,
    markdown: renderMarkdown(data),
  };
}
