# API

The current public interface is the CLI.

## Commands

### `ai-content list`

Lists all registered tools and their commands.

### `ai-content doctor`

Prints a small environment and tool status report.

### `ai-content analyze-url <url>`

Creates a lightweight analysis from a fetched URL snapshot.

### `ai-content multiply <input>`

Reads a text string or file and generates a structured content report.

### `ai-content prompt "<brief>"`

Generates a prompt package and model recommendations.

### `ai-content github <owner/repo|url>`

Queries the GitHub API for repository metadata and summarizes it.

### `ai-content social`

Returns the planned roadmap for the future social publishing command family.

## Output formats

- `--output markdown`
- `--output json`

## Future API direction

The workflow exporter will later emit stable JSON payloads for n8n, OpenClaw,
Ollama, Home Assistant, social publishing, HTML, PDF, and DOCX-oriented pipelines.
