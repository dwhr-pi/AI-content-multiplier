import { Buffer } from "node:buffer";

import { markdownTable, parseRepoReference } from "../core/utils.js";
import type { CliCommandResult, CommandContext, ParsedArgs } from "../core/types.js";

interface GitHubRepo {
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  topics?: string[];
  default_branch: string;
  pushed_at: string;
  updated_at: string;
  archived: boolean;
  license?: { spdx_id?: string | null; name?: string | null } | null;
}

interface GitHubContent {
  name: string;
  type: string;
}

interface GitHubIssue {
  title: string;
  html_url: string;
  pull_request?: unknown;
}

interface GitHubRelease {
  name: string | null;
  tag_name: string;
  published_at: string | null;
}

async function githubRequest<T>(
  path: string,
  token?: string,
): Promise<T | null> {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      accept: "application/vnd.github+json",
      "user-agent": "ai-content-multiplier/0.1.0",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`GitHub request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

function decodeBase64(value: string): string {
  return Buffer.from(value, "base64").toString("utf8");
}

function parseReadmeHeadings(markdown: string): string[] {
  return markdown
    .split("\n")
    .filter((line) => /^#{1,3}\s+/.test(line))
    .map((line) => line.replace(/^#{1,3}\s+/, "").trim())
    .slice(0, 8);
}

function buildIntegrationNotes(
  repo: GitHubRepo,
  contents: GitHubContent[],
): string[] {
  const notes: string[] = [];
  const names = contents.map((item) => item.name.toLowerCase());
  const topics = (repo.topics ?? []).map((topic) => topic.toLowerCase());

  if (names.includes("package.json") || names.includes("pnpm-lock.yaml")) {
    notes.push("Strong JavaScript or TypeScript integration potential.");
  }

  if (names.includes("docker-compose.yml") || names.includes("dockerfile")) {
    notes.push("Can likely be packaged into local or server-side automation flows.");
  }

  if (topics.some((topic) => ["api", "sdk", "cli", "automation", "agent"].includes(topic))) {
    notes.push("Repository topics suggest direct automation or agent integration.");
  }

  if (names.includes(".github")) {
    notes.push("Has GitHub automation metadata that may help CI or release workflows.");
  }

  if (notes.length === 0) {
    notes.push("Integration potential is moderate; more detail will come from deeper code inspection.");
  }

  return notes;
}

function renderMarkdown(data: Record<string, unknown>): string {
  const repo = data.repo as GitHubRepo;
  const headings = data.readmeHeadings as string[];
  const issues = data.openIssues as Array<{ title: string; url: string }>;
  const contents = data.rootContents as string[];
  const releases = data.releases as Array<{ name: string; publishedAt: string }>;
  const notes = data.integrationPotential as string[];

  return [
    `# GitHub Scout Report`,
    ``,
    `## Repository`,
    `- Name: ${repo.full_name}`,
    `- URL: ${repo.html_url}`,
    `- Description: ${repo.description ?? "No description"}`,
    `- Language: ${repo.language ?? "Unknown"}`,
    `- Stars: ${repo.stargazers_count}`,
    `- Forks: ${repo.forks_count}`,
    `- Open issues: ${repo.open_issues_count}`,
    `- Archived: ${repo.archived ? "yes" : "no"}`,
    `- License: ${repo.license?.spdx_id ?? repo.license?.name ?? "Unknown"}`,
    `- Updated: ${repo.updated_at}`,
    ``,
    `## README headings`,
    ...(headings.length > 0 ? headings.map((heading) => `- ${heading}`) : ["- README headings not available"]),
    ``,
    `## Root structure`,
    ...(contents.length > 0 ? contents.map((entry) => `- ${entry}`) : ["- Root contents not available"]),
    ``,
    `## Releases`,
    ...(releases.length > 0
      ? releases.map((release) => `- ${release.name} (${release.publishedAt})`)
      : ["- No release data available"]),
    ``,
    `## Open issues snapshot`,
    ...(issues.length > 0 ? issues.map((issue) => `- ${issue.title} - ${issue.url}`) : ["- No open issues sampled"]),
    ``,
    `## Integration potential`,
    ...notes.map((note) => `- ${note}`),
    ``,
    `## Summary table`,
    markdownTable(
      ["Signal", "Value"],
      [
        ["Default branch", repo.default_branch],
        ["Last push", repo.pushed_at],
        ["Topics", (repo.topics ?? []).join(", ") || "None"],
        ["Top root entries", contents.slice(0, 5).join(", ") || "n/a"],
      ],
    ),
  ].join("\n");
}

export async function runGitHubScout(
  _action: string,
  args: ParsedArgs,
  context: CommandContext,
): Promise<CliCommandResult> {
  const target = args.positional[0];
  if (!target) {
    throw new Error("Missing repository reference. Use owner/repo or a GitHub URL.");
  }

  const { owner, repo } = parseRepoReference(target);
  const token = context.env.GITHUB_TOKEN;

  const repository = await githubRequest<GitHubRepo>(`/repos/${owner}/${repo}`, token);
  if (!repository) {
    throw new Error(`Repository not found: ${owner}/${repo}`);
  }

  const [contents, issues, releases, readmeResponse] = await Promise.all([
    githubRequest<GitHubContent[]>(`/repos/${owner}/${repo}/contents`, token).catch(() => null),
    githubRequest<GitHubIssue[]>(`/repos/${owner}/${repo}/issues?state=open&per_page=5`, token).catch(() => null),
    githubRequest<GitHubRelease[]>(`/repos/${owner}/${repo}/releases?per_page=3`, token).catch(() => null),
    githubRequest<{ content: string }>(`/repos/${owner}/${repo}/readme`, token).catch(() => null),
  ]);

  const readmeMarkdown = readmeResponse?.content ? decodeBase64(readmeResponse.content) : "";
  const readmeHeadings = parseReadmeHeadings(readmeMarkdown);
  const sampledIssues = (issues ?? [])
    .filter((issue) => !issue.pull_request)
    .slice(0, 5)
    .map((issue) => ({ title: issue.title, url: issue.html_url }));
  const rootContents = (contents ?? []).slice(0, 12).map((item) => item.name);
  const releaseSummary = (releases ?? []).map((release) => ({
    name: release.name ?? release.tag_name,
    publishedAt: release.published_at ?? "unknown",
  }));
  const integrationPotential = buildIntegrationNotes(repository, contents ?? []);

  const data: Record<string, unknown> = {
    tool: "github-scout",
    generatedAt: context.now,
    repo: repository,
    readmeHeadings,
    rootContents,
    openIssues: sampledIssues,
    releases: releaseSummary,
    integrationPotential,
  };

  return {
    data,
    markdown: renderMarkdown(data),
  };
}
