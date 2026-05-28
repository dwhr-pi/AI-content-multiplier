# Setup

## Requirements

- Node.js 22+
- pnpm
- Optional: Ollama
- Optional: GitHub token for higher GitHub API rate limits
- Optional: Firecrawl API key

## Install

```bash
pnpm install
pnpm build
```

## Local environment

Copy the example configuration:

```bash
cp config/env.example .env
```

Fill only the providers you actually want to use. The CLI is designed to work
without cloud credentials.

## Useful commands

```bash
pnpm ai-content list
pnpm ai-content doctor
pnpm ai-content analyze-url "https://example.com"
pnpm ai-content multiply examples/input/sample-source.md
pnpm ai-content prompt "Create a cinematic Celtic trance music video"
pnpm ai-content github https://github.com/openai/openai-cookbook
```

## Workflow assets

- n8n blueprint: `workflows/n8n/ai-content-multiplier.workflow.json`
- social publishing blueprint: `workflows/n8n/social-publisher.workflow.json`
- OpenClaw agent: `workflows/openclaw/ai-content-multiplier.agent.json`
- social publishing agent: `workflows/openclaw/social-publisher.agent.json`
- Ollama prompt starter: `workflows/ollama/content-multiplier.prompt.md`

## Notes

- Generated results are drafts and should be reviewed by a human
- Keep `.env` local and out of version control
- The existing legacy integration folders are preserved for compatibility
- Social publishing remains official-API-only and human-approved by design
