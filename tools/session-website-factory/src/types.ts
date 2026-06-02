export type JobStatus = "pending" | "running" | "failed" | "done";
export type TemplateId = "astro-landingpage" | "nextjs-landingpage";
export type LanguageMode = "de" | "en" | "bilingual";
export type LlmProvider = "ollama" | "openclaw" | "openai" | "gemini";

export interface SessionWebsiteJob {
  id: string;
  idea: string;
  projectName: string;
  slug: string;
  template: TemplateId;
  language: LanguageMode;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  attempts: number;
  maxFixRounds: number;
  outputDir: string;
  reportPath: string;
  error?: string;
  llmProvider: LlmProvider;
  previewUrl?: string;
}

export interface QueueState {
  jobs: SessionWebsiteJob[];
}

export interface RuntimeConfig {
  rootDir: string;
  templatesDir: string;
  jobsDir: string;
  resultsDir: string;
  queuePath: string;
  lockPath: string;
  provider: LlmProvider;
  ollamaBaseUrl: string;
  ollamaModel: string;
  openAiApiKey: string;
  openAiModel: string;
  geminiApiKey: string;
  geminiModel: string;
  openClawAgentName: string;
  maxParallelJobs: number;
  maxCpuPercent: number;
  maxRamPercent: number;
  jobTimeoutSeconds: number;
  fixTimeoutSeconds: number;
  maxFixRounds: number;
  defaultTemplate: TemplateId;
  defaultLanguage: LanguageMode;
  previewPort: number;
}

export interface WebsitePlan {
  projectName: string;
  slug: string;
  template: TemplateId;
  language: LanguageMode;
  providerUsed: LlmProvider | "fallback";
  audience: string;
  productName: string;
  headlineDe: string;
  headlineEn: string;
  subheadlineDe: string;
  subheadlineEn: string;
  primaryCtaDe: string;
  primaryCtaEn: string;
  secondaryCtaDe: string;
  secondaryCtaEn: string;
  featureTitleDe: string;
  featureTitleEn: string;
  featureItemsDe: string[];
  featureItemsEn: string[];
  contactHeadingDe: string;
  contactHeadingEn: string;
  contactBodyDe: string;
  contactBodyEn: string;
  legalCompanyPlaceholder: string;
  legalAddressPlaceholder: string;
  legalEmailPlaceholder: string;
  notes: string[];
}

export interface GeneratedProject {
  projectRoot: string;
  previewRoot: string;
  exportRoot: string;
  readmePath: string;
  planPath: string;
  previewIndexPath: string;
}

export interface CommandExecutionResult {
  command: string;
  exitCode: number;
  durationMs: number;
  stdout: string;
  stderr: string;
  timedOut: boolean;
}

export interface FixRound {
  round: number;
  install: CommandExecutionResult;
  build?: CommandExecutionResult;
  actions: string[];
  succeeded: boolean;
}

export interface FixReport {
  ok: boolean;
  rounds: FixRound[];
  buildReportPath: string;
}
