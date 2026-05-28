# Architecture

AI Content Multiplier uses a CLI-first, local-first architecture with a modular
registry that can grow from prompt-driven MVPs into richer adapters and
automation flows.

## Core layers

```text
Inputs
  URL / Text / Markdown / PDF / Transcript / Repo URL
      |
      v
CLI Router
  src/cli.ts
      |
      v
Tool Registry
  src/registry/tool-registry.ts
      |
      v
Tool Modules
  content-multiplier / prompt-generator / github-scout / planned tools
      |
      v
Outputs
  Markdown / JSON / Workflow assets / Local reports
```

## Design principles

- Local-first by default with Ollama as the primary model target
- Simple, inspectable CLI workflows before background automation
- Tool isolation so each module can evolve independently
- Markdown and JSON as the default portable output formats
- Optional integrations through config and environment variables

## Planned evolution

1. Replace heuristic generation with model adapters
2. Add workflow exporter and knowledge-base persistence
3. Add Firecrawl, PDF, and transcript ingestion adapters
4. Add RAG-ready storage and retrieval workflows
