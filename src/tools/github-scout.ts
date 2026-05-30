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
    throw new Error(`GitHub-Anfrage ist mit Status ${response.status} fehlgeschlagen`);
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
    notes.push("Starkes Integrationspotenzial fuer JavaScript- oder TypeScript-Umgebungen.");
  }

  if (names.includes("docker-compose.yml") || names.includes("dockerfile")) {
    notes.push("Laesst sich voraussichtlich gut in lokale oder serverseitige Automationsablaeufe einbinden.");
  }

  if (topics.some((topic) => ["api", "sdk", "cli", "automation", "agent"].includes(topic))) {
    notes.push("Die Repository-Themen deuten auf direkte Automation oder Agenten-Integration hin.");
  }

  if (names.includes(".github")) {
    notes.push("Enthaelt GitHub-Automationsmetadaten, die fuer CI oder Releases hilfreich sein koennen.");
  }

  if (notes.length === 0) {
    notes.push("Das Integrationspotenzial wirkt solide, benoetigt aber tiefere Codepruefung fuer mehr Sicherheit.");
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
    `# GitHub-Scout-Bericht`,
    ``,
    `## Repository`,
    `- Name: ${repo.full_name}`,
    `- URL: ${repo.html_url}`,
    `- Beschreibung: ${repo.description ?? "Keine Beschreibung"}`,
    `- Sprache: ${repo.language ?? "Unbekannt"}`,
    `- Stars: ${repo.stargazers_count}`,
    `- Forks: ${repo.forks_count}`,
    `- Offene Issues: ${repo.open_issues_count}`,
    `- Archiviert: ${repo.archived ? "ja" : "nein"}`,
    `- Lizenz: ${repo.license?.spdx_id ?? repo.license?.name ?? "Unbekannt"}`,
    `- Aktualisiert: ${repo.updated_at}`,
    ``,
    `## README-Ueberschriften`,
    ...(headings.length > 0 ? headings.map((heading) => `- ${heading}`) : ["- Keine README-Ueberschriften verfuegbar"]),
    ``,
    `## Root-Struktur`,
    ...(contents.length > 0 ? contents.map((entry) => `- ${entry}`) : ["- Kein Root-Inhalt verfuegbar"]),
    ``,
    `## Releases`,
    ...(releases.length > 0
      ? releases.map((release) => `- ${release.name} (${release.publishedAt})`)
      : ["- Keine Release-Daten verfuegbar"]),
    ``,
    `## Stichprobe offener Issues`,
    ...(issues.length > 0 ? issues.map((issue) => `- ${issue.title} - ${issue.url}`) : ["- Keine offenen Issues in der Stichprobe"]),
    ``,
    `## Integrationspotenzial`,
    ...notes.map((note) => `- ${note}`),
    ``,
    `## Uebersichtstabelle`,
    markdownTable(
      ["Signal", "Wert"],
      [
        ["Standard-Branch", repo.default_branch],
        ["Letzter Push", repo.pushed_at],
        ["Themen", (repo.topics ?? []).join(", ") || "Keine"],
        ["Top-Root-Eintraege", contents.slice(0, 5).join(", ") || "k. A."],
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
    throw new Error("Repository-Referenz fehlt. Bitte owner/repo oder eine GitHub-URL angeben.");
  }

  const { owner, repo } = parseRepoReference(target);
  const token = context.env.GITHUB_TOKEN;

  const repository = await githubRequest<GitHubRepo>(`/repos/${owner}/${repo}`, token);
  if (!repository) {
    throw new Error(`Repository nicht gefunden: ${owner}/${repo}`);
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
    publishedAt: release.published_at ?? "unbekannt",
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
