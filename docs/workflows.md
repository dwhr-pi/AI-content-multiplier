# Workflows

The repository keeps workflow assets in canonical subdirectories under
`workflows/`.

## Canonical locations

- `workflows/n8n/`
- `workflows/openclaw/`
- `workflows/ollama/`

Current examples include content multiplication and social publishing blueprints.

## Compatibility note

Existing top-level folders remain in place:

- `n8n/`
- `openclaw/`
- `nextcloud/`
- `home-assistant/`

They are kept so older Ultimate Setup integrations do not break while the new
tool collection structure is introduced.

## Typical flow

```text
Source
  -> analyze
  -> enrich
  -> draft outputs
  -> human review
  -> export
  -> automation handoff
```

## Social publishing flow

```text
Input idea
  -> Content Multiplier
  -> Prompt Generator
  -> Media preparation
  -> Policy checks
  -> Posting draft
  -> Human approval
  -> Official API publishing
  -> Logging and analytics
```
