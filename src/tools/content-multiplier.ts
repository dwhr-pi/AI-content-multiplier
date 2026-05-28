import { getFlagString, extractKeywords, normalizeWhitespace, readSourceInput, splitSentences, titleFromText, trimWords, uniqueStrings } from "../core/utils.js";
import type { CliCommandResult, CommandContext, ParsedArgs } from "../core/types.js";

interface ContentAnalysis {
  title: string;
  summary: string;
  shortSummary: string;
  longSummary: string;
  audience: string;
  tone: string;
  keyPoints: string[];
  hooks: string[];
  callToAction: string;
  seoKeywords: string[];
  risks: string[];
}

async function fetchUrlSnapshot(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": "ai-content-multiplier/0.1.0",
      },
    });

    if (!response.ok) {
      return `URL: ${url}\nStatus: ${response.status}`;
    }

    const html = await response.text();
    const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? "";
    const description =
      html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)/i)?.[1]?.trim() ??
      html.match(/<meta\s+content=["']([^"']+)"\s+name=["']description["']/i)?.[1]?.trim() ??
      "";
    const headings = [...html.matchAll(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi)]
      .map((match) => match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .slice(0, 10);

    return normalizeWhitespace(
      [
        `URL: ${url}`,
        title ? `Title: ${title}` : "",
        description ? `Description: ${description}` : "",
        headings.length > 0 ? `Headings: ${headings.join(" | ")}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown fetch error";
    return `URL: ${url}\nFetch note: ${message}`;
  } finally {
    clearTimeout(timeout);
  }
}

function detectAudience(text: string): string {
  const lowered = text.toLowerCase();

  if (/(developer|api|github|cli|typescript|automation)/.test(lowered)) {
    return "Builders, developers, and technical operators";
  }

  if (/(marketing|brand|audience|campaign|seo|content)/.test(lowered)) {
    return "Marketing teams, creators, and growth-focused operators";
  }

  if (/(music|video|reel|shorts|storyboard)/.test(lowered)) {
    return "Creative teams producing short-form media";
  }

  return "Operators who need a clear summary and reusable next steps";
}

function detectTone(text: string): string {
  const lowered = text.toLowerCase();

  if (/(urgent|now|immediately|critical|must)/.test(lowered)) {
    return "Direct and action-oriented";
  }

  if (/(research|evidence|study|analysis|report)/.test(lowered)) {
    return "Analytical and insight-driven";
  }

  if (/(story|creator|brand|community|audience)/.test(lowered)) {
    return "Conversational and persuasive";
  }

  return "Clear, practical, and informative";
}

function detectHooks(title: string, summary: string, keywords: string[]): string[] {
  return uniqueStrings([
    `What most teams miss about ${keywords[0] ?? "this topic"}`,
    `A faster way to turn ${keywords[1] ?? "raw material"} into publishable assets`,
    `${title} in one practical breakdown`,
    `The short path from source material to reusable content`,
    trimWords(summary, 12),
  ]).slice(0, 4);
}

function detectCallToAction(keywords: string[]): string {
  const primary = keywords[0] ?? "your workflow";
  return `Review the draft, validate the facts, and adapt ${primary} into your next publish-ready asset.`;
}

function detectRisks(text: string): string[] {
  const lowered = text.toLowerCase();
  const risks = [
    "Validate claims, dates, and named entities before publishing.",
    "Review copyright and platform usage rights for source material.",
    "Keep auto-publishing disabled until a human approves the final copy.",
  ];

  if (/(health|medical|legal|finance|security)/.test(lowered)) {
    risks.unshift("This topic may require expert review because it can affect high-stakes decisions.");
  }

  if (/(personal data|customer data|private|confidential)/.test(lowered)) {
    risks.unshift("Remove or anonymize sensitive data before exporting drafts.");
  }

  return uniqueStrings(risks);
}

function buildAnalysis(text: string): ContentAnalysis {
  const cleaned = normalizeWhitespace(text);
  const sentences = splitSentences(cleaned);
  const keywords = extractKeywords(cleaned, 10);
  const title = titleFromText(cleaned);
  const summary = trimWords(cleaned, 60);
  const shortSummary = trimWords(cleaned, 20);
  const longSummary = trimWords(cleaned, 120);
  const keyPoints = uniqueStrings(
    sentences
      .map((sentence) => sentence.replace(/\s+/g, " ").trim())
      .filter((sentence) => sentence.length > 32)
      .slice(0, 5),
  );

  return {
    title,
    summary,
    shortSummary,
    longSummary,
    audience: detectAudience(cleaned),
    tone: detectTone(cleaned),
    keyPoints,
    hooks: detectHooks(title, summary, keywords),
    callToAction: detectCallToAction(keywords),
    seoKeywords: keywords,
    risks: detectRisks(cleaned),
  };
}

function buildOutputs(analysis: ContentAnalysis): Record<string, unknown> {
  const points = analysis.keyPoints.length > 0 ? analysis.keyPoints : [analysis.summary];
  const hook = analysis.hooks[0] ?? analysis.title;
  const secondHook = analysis.hooks[1] ?? analysis.shortSummary;

  return {
    linkedinPost: `${hook}\n\n${analysis.summary}\n\nKey takeaways:\n- ${points.join("\n- ")}\n\n${analysis.callToAction}`,
    xThread: [
      `${hook}`,
      `${secondHook}`,
      ...points.map((point, index) => `${index + 3}. ${point}`),
      `Final note: ${analysis.callToAction}`,
    ],
    facebookPost: `${analysis.summary}\n\nWhat stands out:\n- ${points.join("\n- ")}\n\n${analysis.callToAction}`,
    blogArticle: `# ${analysis.title}\n\n## Why it matters\n${analysis.summary}\n\n## Key points\n- ${points.join("\n- ")}\n\n## Practical angle\nThis topic fits ${analysis.audience.toLowerCase()} and works best with a ${analysis.tone.toLowerCase()} voice.\n\n## Next step\n${analysis.callToAction}`,
    newsletter: `Subject: ${hook}\n\nHi team,\n\n${analysis.longSummary}\n\nHighlights:\n- ${points.join("\n- ")}\n\n${analysis.callToAction}`,
    faq: [
      {
        question: "What is the main idea?",
        answer: analysis.shortSummary,
      },
      {
        question: "Who is this for?",
        answer: analysis.audience,
      },
      {
        question: "What should happen next?",
        answer: analysis.callToAction,
      },
    ],
    seoKeywords: analysis.seoKeywords,
    youtubeScript: `Hook: ${hook}\n\nIntro:\n${analysis.shortSummary}\n\nBody:\n- ${points.join("\n- ")}\n\nOutro:\n${analysis.callToAction}`,
    instagramCaption: `${hook}\n\n${analysis.shortSummary}\n\n#${analysis.seoKeywords.slice(0, 5).join(" #")}`,
    shortSummary: analysis.shortSummary,
    longSummary: analysis.longSummary,
  };
}

function renderMarkdown(result: Record<string, unknown>): string {
  const analysis = result.analysis as ContentAnalysis;
  const outputs = result.outputs as Record<string, unknown>;
  const thread = outputs.xThread as string[];
  const faq = outputs.faq as Array<{ question: string; answer: string }>;

  return [
    `# Content Multiplier Report`,
    ``,
    `## Source`,
    `- Input: ${(result.sourceLabel as string) ?? "unknown"}`,
    `- Source type: ${(result.sourceType as string) ?? "unknown"}`,
    `- Generated: ${(result.generatedAt as string) ?? ""}`,
    ``,
    `## Analysis`,
    `- Title: ${analysis.title}`,
    `- Audience: ${analysis.audience}`,
    `- Tone: ${analysis.tone}`,
    `- Summary: ${analysis.summary}`,
    ``,
    `### Key points`,
    ...analysis.keyPoints.map((point) => `- ${point}`),
    ``,
    `### Hooks`,
    ...analysis.hooks.map((hook) => `- ${hook}`),
    ``,
    `### Risks`,
    ...analysis.risks.map((risk) => `- ${risk}`),
    ``,
    `### SEO keywords`,
    analysis.seoKeywords.join(", "),
    ``,
    `## Draft outputs`,
    `### LinkedIn post`,
    outputs.linkedinPost as string,
    ``,
    `### X thread`,
    ...thread.map((line) => `- ${line}`),
    ``,
    `### Blog article`,
    outputs.blogArticle as string,
    ``,
    `### Newsletter`,
    outputs.newsletter as string,
    ``,
    `### FAQ`,
    ...faq.map((item) => `- ${item.question} ${item.answer}`),
    ``,
    `### YouTube script`,
    outputs.youtubeScript as string,
    ``,
    `### Instagram caption`,
    outputs.instagramCaption as string,
  ].join("\n");
}

export async function runContentMultiplier(
  action: string,
  args: ParsedArgs,
  context: CommandContext,
): Promise<CliCommandResult> {
  const firstInput = args.positional[0] ?? getFlagString(args.flags, "input");
  if (!firstInput) {
    throw new Error("Missing input. Use a file path, raw text, or URL.");
  }

  let sourceType = "text";
  let sourceLabel = firstInput;
  let sourceContent = firstInput;

  if (action === "analyze-url") {
    sourceType = "url";
    sourceLabel = firstInput;
    sourceContent = await fetchUrlSnapshot(firstInput);
  } else {
    const source = await readSourceInput(firstInput, context.cwd);
    sourceType = source.sourceType;
    sourceLabel = source.location;
    sourceContent = source.content;
  }

  const analysis = buildAnalysis(sourceContent);
  const outputs = buildOutputs(analysis);
  const data: Record<string, unknown> = {
    tool: "content-multiplier",
    action,
    sourceType,
    sourceLabel,
    generatedAt: context.now,
    analysis,
    outputs,
  };

  return {
    data,
    markdown: renderMarkdown(data),
  };
}
