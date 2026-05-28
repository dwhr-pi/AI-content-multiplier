import type { ToolDefinition } from "../core/types.js";
import { runContentMultiplier } from "../tools/content-multiplier.js";
import { runGitHubScout } from "../tools/github-scout.js";
import { runPromptGenerator } from "../tools/prompt-generator.js";

export const toolRegistry: ToolDefinition[] = [
  {
    id: "content-multiplier",
    name: "Content Multiplier",
    status: "mvp",
    summary: "Transforms source material into reusable multi-platform drafts.",
    categories: ["content", "marketing", "seo"],
    commands: [
      {
        name: "analyze-url",
        summary: "Fetches a URL snapshot and creates a content analysis report.",
        example: "pnpm ai-content analyze-url https://example.com",
      },
      {
        name: "multiply",
        summary: "Converts a file or raw text into multiple output formats.",
        example: "pnpm ai-content multiply examples/input/sample-source.md",
      },
    ],
    run: runContentMultiplier,
  },
  {
    id: "reverse-engineer",
    name: "Content Reverse Engineer",
    status: "planned",
    summary: "Breaks successful content into hooks, structure, and viral patterns.",
    categories: ["content", "analysis"],
    commands: [
      {
        name: "reverse",
        summary: "Analyzes a transcript or post for reusable performance patterns.",
        example: "pnpm ai-content reverse transcript.md",
      },
    ],
    roadmap: [
      "Hook and CTA extraction",
      "Audience and emotion mapping",
      "Reusable pattern scoring",
    ],
  },
  {
    id: "research-agent",
    name: "AI Research Agent",
    status: "planned",
    summary: "Builds source-backed research reports from local and online material.",
    categories: ["research", "analysis"],
    commands: [
      {
        name: "research",
        summary: "Collects sources and generates a recommendation report.",
        example: "pnpm ai-content research docs/topic.md",
      },
    ],
  },
  {
    id: "github-scout",
    name: "GitHub Scout",
    status: "mvp",
    summary: "Scans GitHub repositories for repo health and integration potential.",
    categories: ["github", "research", "open-source"],
    commands: [
      {
        name: "github",
        summary: "Analyzes a GitHub repository URL or owner/repo reference.",
        example: "pnpm ai-content github https://github.com/openai/openai-cookbook",
      },
    ],
    run: runGitHubScout,
  },
  {
    id: "clone-finder",
    name: "Open Source Clone Finder",
    status: "planned",
    summary: "Finds alternatives, forks, and license-aware clone ecosystems.",
    categories: ["open-source", "research"],
    commands: [
      {
        name: "clone-find",
        summary: "Searches for comparable open-source tools.",
        example: "pnpm ai-content clone-find notion",
      },
    ],
  },
  {
    id: "project-architect",
    name: "Project Architect",
    status: "planned",
    summary: "Turns an idea into architecture, roadmap, and issue-ready plans.",
    categories: ["planning", "architecture"],
    commands: [
      {
        name: "architect",
        summary: "Generates project architecture and MVP guidance.",
        example: "pnpm ai-content architect \"Local AI dashboard for creators\"",
      },
    ],
  },
  {
    id: "prompt-generator",
    name: "Prompt Generator Pro",
    status: "mvp",
    summary: "Creates prompt packages plus model recommendations.",
    categories: ["prompting", "creative", "models"],
    commands: [
      {
        name: "prompt",
        summary: "Builds a prompt bundle from a short request.",
        example: "pnpm ai-content prompt \"Create a Celtic trance music video\"",
      },
    ],
    run: runPromptGenerator,
  },
  {
    id: "video-factory",
    name: "Video Factory",
    status: "planned",
    summary: "Builds storyboard, prompt chains, and post-ready short-form assets.",
    categories: ["video", "creative"],
    commands: [
      {
        name: "video",
        summary: "Creates a short-form video production plan.",
        example: "pnpm ai-content video \"A synthwave product launch short\"",
      },
    ],
  },
  {
    id: "social-publisher",
    name: "Social Publisher",
    status: "planned",
    summary: "Prepares human-approved publishing drafts for official social platform APIs.",
    categories: ["social", "automation", "publishing"],
    commands: [
      {
        name: "social",
        summary: "Scaffolds future account connection, draft, schedule, and publish flows.",
        example: "pnpm ai-content social",
      },
    ],
    roadmap: [
      "OAuth account connection with encrypted token storage",
      "Draft validation for media, captions, hashtags, and policy risks",
      "Human approval gates before official API publish or scheduling",
    ],
  },
  {
    id: "knowledge-base",
    name: "Self Learning Knowledge Base",
    status: "planned",
    summary: "Stores markdown, transcripts, and RAG-friendly local knowledge assets.",
    categories: ["knowledge", "rag", "storage"],
    commands: [
      {
        name: "knowledge",
        summary: "Imports and normalizes local knowledge assets.",
        example: "pnpm ai-content knowledge import examples/input/sample-source.md",
      },
    ],
  },
  {
    id: "workflow-exporter",
    name: "Workflow Exporter",
    status: "planned",
    summary: "Exports results to automation, markdown, and office-friendly formats.",
    categories: ["workflows", "automation", "exports"],
    commands: [
      {
        name: "export",
        summary: "Exports reports into structured integration targets.",
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
