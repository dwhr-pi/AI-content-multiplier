import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";

import type { ParsedArgs, SourceInput } from "./types.js";

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "have",
  "in",
  "is",
  "it",
  "its",
  "of",
  "on",
  "or",
  "that",
  "the",
  "their",
  "this",
  "to",
  "was",
  "we",
  "with",
  "you",
  "your",
]);

export function parseArgs(argv: string[]): ParsedArgs {
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token.startsWith("--")) {
      const name = token.slice(2);
      const next = argv[index + 1];

      if (!next || next.startsWith("-")) {
        flags[name] = true;
        continue;
      }

      flags[name] = next;
      index += 1;
      continue;
    }

    positional.push(token);
  }

  return { positional, flags };
}

export function getFlagString(
  flags: Record<string, string | boolean>,
  name: string,
  fallback = "",
): string {
  const value = flags[name];
  return typeof value === "string" ? value : fallback;
}

export function hasFlag(
  flags: Record<string, string | boolean>,
  name: string,
): boolean {
  return Boolean(flags[name]);
}

export function isProbablyUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export async function fileExists(targetPath: string): Promise<boolean> {
  try {
    await access(targetPath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function readSourceInput(
  rawInput: string,
  cwd: string,
): Promise<SourceInput> {
  if (isProbablyUrl(rawInput)) {
    return {
      sourceType: "url",
      location: rawInput,
      content: rawInput,
    };
  }

  const absolutePath = path.resolve(cwd, rawInput);
  if (await fileExists(absolutePath)) {
    const content = await readFile(absolutePath, "utf8");
    return {
      sourceType: "file",
      location: absolutePath,
      content,
    };
  }

  return {
    sourceType: "text",
    location: "inline",
    content: rawInput,
  };
}

export function normalizeWhitespace(value: string): string {
  return value.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
}

export function splitSentences(value: string): string[] {
  return normalizeWhitespace(value)
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

export function trimWords(value: string, maxWords: number): string {
  const words = normalizeWhitespace(value).split(/\s+/);
  if (words.length <= maxWords) {
    return words.join(" ");
  }

  return `${words.slice(0, maxWords).join(" ")}...`;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function extractKeywords(value: string, limit = 8): string[] {
  const counts = new Map<string, number>();
  const words = normalizeWhitespace(value)
    .toLowerCase()
    .match(/[a-z0-9][a-z0-9-]{2,}/g);

  for (const word of words ?? []) {
    if (STOP_WORDS.has(word)) {
      continue;
    }

    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .map(([word]) => word);
}

export function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

export function titleFromText(value: string): string {
  const [firstLine] = normalizeWhitespace(value).split("\n");
  if (firstLine) {
    return firstLine.replace(/^#+\s*/, "").trim().slice(0, 80);
  }

  return "Untitled source";
}

export function markdownTable(
  headers: string[],
  rows: string[][],
): string {
  const headerLine = `| ${headers.join(" | ")} |`;
  const dividerLine = `| ${headers.map(() => "---").join(" | ")} |`;
  const rowLines = rows.map((row) => `| ${row.join(" | ")} |`);
  return [headerLine, dividerLine, ...rowLines].join("\n");
}

export function parseRepoReference(value: string): { owner: string; repo: string } {
  if (/^https?:\/\//i.test(value)) {
    const url = new URL(value);
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments.length >= 2) {
      return {
        owner: segments[0],
        repo: segments[1].replace(/\.git$/i, ""),
      };
    }
  }

  const parts = value.split("/").filter(Boolean);
  if (parts.length === 2) {
    return {
      owner: parts[0],
      repo: parts[1].replace(/\.git$/i, ""),
    };
  }

  throw new Error(`Could not parse repository reference: ${value}`);
}

export function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
