# Social Publisher

Status: Planned foundation

`social-publisher` is a human-in-the-loop publishing module for official social
platform APIs.

## Guardrails

- No fake-account or mass-account creation
- No password storage
- No cookie automation
- No browser scraping for publishing
- No posting without explicit human approval
- Only officially connected accounts may be used

## Initial target platforms

- Instagram Business / Creator via official Meta APIs
- Facebook Pages
- LinkedIn
- YouTube
- X / Twitter
- TikTok later

## Planned CLI shape

```bash
pnpm ai-content social connect instagram
pnpm ai-content social list-accounts
pnpm ai-content social draft instagram ./examples/output/post.md
pnpm ai-content social schedule instagram ./examples/output/post.md --time "2026-06-01T18:00:00+02:00"
pnpm ai-content social publish instagram ./examples/output/post.md --confirm
```

## Module layout

- `src/providers/` for official platform adapters
- `src/auth/` for OAuth and secure token handling
- `src/queue/` for scheduling and publish jobs
- `src/moderation/` for safety, copyright, and policy checks
- `prompts/` for caption and approval prompt templates
- `examples/` for safe sample payloads

## Safety model

The publishing workflow is intentionally designed as:

```text
Human creates account
  -> Human authorizes OAuth
  -> AI prepares draft
  -> Safety checks run
  -> Human confirms
  -> Official API publishes or schedules
  -> Result is logged
```
