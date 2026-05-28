export type OutputFormat = "markdown" | "json";
export type ToolStatus = "mvp" | "planned";

export interface ParsedArgs {
  positional: string[];
  flags: Record<string, string | boolean>;
}

export interface CommandContext {
  cwd: string;
  env: NodeJS.ProcessEnv;
  format: OutputFormat;
  now: string;
}

export interface CliCommandResult {
  markdown: string;
  data: Record<string, unknown>;
}

export interface ToolCommand {
  name: string;
  summary: string;
  example: string;
}

export interface ToolDefinition {
  id: string;
  name: string;
  status: ToolStatus;
  summary: string;
  categories: string[];
  commands: ToolCommand[];
  roadmap?: string[];
  run?: (
    action: string,
    args: ParsedArgs,
    context: CommandContext,
  ) => Promise<CliCommandResult>;
}

export interface SourceInput {
  sourceType: "file" | "text" | "url";
  location: string;
  content: string;
}
