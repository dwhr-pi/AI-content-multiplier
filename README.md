# AI Content Multiplier

AI Content Multiplier is a local-first, modular tool collection for analyzing,
reconstructing, transforming, and exporting content for multiple platforms.

The repository is designed as a building block for an "Ultimate KI Setup" with
strong support for Ollama, OpenClaw, n8n, Firecrawl, GitHub, Nextcloud, and
Home Assistant.

## What is included

- A TypeScript CLI for local workflows
- A modular tool registry with implemented and planned tools
- MVPs for `content-multiplier`, `prompt-generator`, and `github-scout`
- OpenClaw, n8n, and Ollama workflow assets
- Reusable profiles for content, research, reverse engineering, and planning
- Example inputs, outputs, reports, and integration configs

## Current tool status

| Tool | Status | Purpose |
|---|---|---|
| Content Multiplier | MVP | Turns source material into multi-platform draft outputs |
| Prompt Generator Pro | MVP | Builds prompts plus model recommendations |
| GitHub Scout | MVP | Analyzes GitHub repositories and integration potential |
| Content Reverse Engineer | Planned | Breaks down viral hooks, CTA patterns, and storytelling |
| AI Research Agent | Planned | Creates summaries, comparisons, and source-backed reports |
| Open Source Clone Finder | Planned | Finds alternatives, forks, and clone ecosystems |
| Project Architect | Planned | Converts ideas into architecture, roadmap, and MVP plans |
| Video Factory | Planned | Generates scripts, storyboards, prompt chains, and shot plans |
| Social Publisher | Planned | Prepares human-approved publishing drafts for official social APIs |
| Self Learning Knowledge Base | Planned | Stores knowledge and prepares RAG-friendly assets |
| Workflow Exporter | Planned | Exports results to automation and document formats |

## Project layout

```text
AI-content-multiplier/
├─ config/
├─ docs/
├─ examples/
├─ profiles/
├─ scripts/
├─ src/
├─ tools/
├─ workflows/
├─ .env.example
├─ package.json
├─ README.md
└─ tsconfig.json
```

The repository also keeps legacy top-level folders such as `openclaw/`,
`n8n/`, `nextcloud/`, and `home-assistant/` for compatibility with the
existing setup. The new canonical workflow assets live in `workflows/`.

## Quick start

```bash
pnpm install
pnpm build

pnpm ai-content list
pnpm ai-content analyze-url "https://example.com"
pnpm ai-content multiply examples/input/sample-source.md
pnpm ai-content github https://github.com/openai/openai-cookbook
pnpm ai-content prompt "Create a Celtic trance music video"
pnpm ai-content social
```

## CLI commands

```bash
pnpm ai-content list
pnpm ai-content doctor
pnpm ai-content analyze-url "https://example.com" --output markdown
pnpm ai-content multiply input.md --output json
pnpm ai-content reverse transcript.md
pnpm ai-content github https://github.com/example/repo
pnpm ai-content prompt "Erstelle ein Musikvideo im Celtic Trance Stil"
pnpm ai-content social
```

## Local-first defaults

- Ollama is the default model route
- Cloud APIs stay optional through environment variables
- Generated content is treated as draft output
- Auto-publishing is disabled by default
- Secrets must never be committed

## Integrations

- Ollama for local text generation
- OpenClaw for agent orchestration
- n8n for workflow automation
- Firecrawl for URL extraction
- GitHub for repository intelligence
- Official social APIs for human-approved publishing workflows
- Nextcloud/myNextcloud for file storage
- Home Assistant for local notifications and triggers

## Documentation

- [Architecture](docs/architecture.md)
- [Tools](docs/tools.md)
- [Workflows](docs/workflows.md)
- [Prompts](docs/prompts.md)
- [API](docs/api.md)
- [Setup](docs/setup.md)

Legacy integration notes remain available in:

- [Legacy architecture](docs/ARCHITECTURE.md)
- [Legacy workflow](docs/WORKFLOW.md)
- [Ultimate setup integration](docs/ULTIMATE_KI_SETUP_INTEGRATION.md)

## Safety

- Do not commit API keys, tokens, or personal data
- Review generated content before publication
- Respect copyright, licensing, and platform terms
- Use cloud models only after explicit local configuration
- Never automate fake-account creation, password login, or cookie-based posting

## Roadmap

1. Stabilize the CLI MVPs
2. Add real Ollama and Firecrawl adapters
3. Extend workflow export targets
4. Add knowledge-base, research, and social publishing modules
5. Expand automation templates for n8n and OpenClaw
