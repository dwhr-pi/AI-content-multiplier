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
        title ? `Titel: ${title}` : "",
        description ? `Beschreibung: ${description}` : "",
        headings.length > 0 ? `Ueberschriften: ${headings.join(" | ")}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "unbekannter Abruffehler";
    return `URL: ${url}\nAbrufhinweis: ${message}`;
  } finally {
    clearTimeout(timeout);
  }
}

function detectAudience(text: string): string {
  const lowered = text.toLowerCase();

  if (/(developer|api|github|cli|typescript|automation)/.test(lowered)) {
    return "Builder, Entwickler und technische Operatoren";
  }

  if (/(marketing|brand|audience|campaign|seo|content)/.test(lowered)) {
    return "Marketing-Teams, Creator und wachstumsorientierte Operatoren";
  }

  if (/(music|video|reel|shorts|storyboard)/.test(lowered)) {
    return "Kreative Teams fuer Kurzvideo- und Medienproduktion";
  }

  return "Operatoren, die eine klare Zusammenfassung und wiederverwendbare naechste Schritte benoetigen";
}

function detectTone(text: string): string {
  const lowered = text.toLowerCase();

  if (/(urgent|now|immediately|critical|must)/.test(lowered)) {
    return "Direkt und handlungsorientiert";
  }

  if (/(research|evidence|study|analysis|report)/.test(lowered)) {
    return "Analytisch und erkenntnisorientiert";
  }

  if (/(story|creator|brand|community|audience)/.test(lowered)) {
    return "Nahbar und ueberzeugend";
  }

  return "Klar, praktisch und informativ";
}

function detectHooks(title: string, summary: string, keywords: string[]): string[] {
  return uniqueStrings([
    `Was die meisten Teams bei ${keywords[0] ?? "diesem Thema"} uebersehen`,
    `Ein schnellerer Weg von ${keywords[1] ?? "Rohmaterial"} zu veroeffentlichbaren Assets`,
    `${title} in einer praktischen Einordnung`,
    `Der kurze Weg von der Quelle zum wiederverwendbaren Content`,
    trimWords(summary, 12),
  ]).slice(0, 4);
}

function detectCallToAction(keywords: string[]): string {
  const primary = keywords[0] ?? "deinen Workflow";
  return `Pruefe den Entwurf, validiere die Fakten und ueberfuehre ${primary} in dein naechstes veroefentlichungsreifes Asset.`;
}

function detectRisks(text: string): string[] {
  const lowered = text.toLowerCase();
  const risks = [
    "Aussagen, Daten und genannte Entitaeten vor der Nutzung pruefen.",
    "Urheberrecht und Plattformnutzungsrechte der Quelle pruefen.",
    "Automatisches Publishing deaktiviert lassen, bis ein Mensch final freigibt.",
  ];

  if (/(health|medical|legal|finance|security)/.test(lowered)) {
    risks.unshift("Dieses Thema kann fachliche Pruefung benoetigen, weil es folgenreiche Entscheidungen beeinflussen kann.");
  }

  if (/(personal data|customer data|private|confidential)/.test(lowered)) {
    risks.unshift("Sensible Daten vor dem Export von Entwuerfen entfernen oder anonymisieren.");
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
    linkedinPost: `${hook}\n\n${analysis.summary}\n\nWichtigste Punkte:\n- ${points.join("\n- ")}\n\n${analysis.callToAction}`,
    xThread: [
      `${hook}`,
      `${secondHook}`,
      ...points.map((point, index) => `${index + 3}. ${point}`),
      `Zum Abschluss: ${analysis.callToAction}`,
    ],
    facebookPost: `${analysis.summary}\n\nWas besonders auffaellt:\n- ${points.join("\n- ")}\n\n${analysis.callToAction}`,
    blogArticle: `# ${analysis.title}\n\n## Warum das wichtig ist\n${analysis.summary}\n\n## Kernpunkte\n- ${points.join("\n- ")}\n\n## Praktischer Blickwinkel\nDieses Thema passt fuer ${analysis.audience.toLowerCase()} und wirkt am besten mit einer ${analysis.tone.toLowerCase()}en Stimme.\n\n## Naechster Schritt\n${analysis.callToAction}`,
    newsletter: `Betreff: ${hook}\n\nHallo zusammen,\n\n${analysis.longSummary}\n\nHighlights:\n- ${points.join("\n- ")}\n\n${analysis.callToAction}`,
    faq: [
      {
        question: "Was ist die Hauptidee?",
        answer: analysis.shortSummary,
      },
      {
        question: "Fuer wen ist das gedacht?",
        answer: analysis.audience,
      },
      {
        question: "Was sollte als Naechstes passieren?",
        answer: analysis.callToAction,
      },
    ],
    seoKeywords: analysis.seoKeywords,
    youtubeScript: `Hook: ${hook}\n\nIntro:\n${analysis.shortSummary}\n\nHauptteil:\n- ${points.join("\n- ")}\n\nOutro:\n${analysis.callToAction}`,
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
    `# Content-Multiplier-Bericht`,
    ``,
    `## Quelle`,
    `- Eingabe: ${(result.sourceLabel as string) ?? "unbekannt"}`,
    `- Quelltyp: ${(result.sourceType as string) ?? "unbekannt"}`,
    `- Erzeugt am: ${(result.generatedAt as string) ?? ""}`,
    ``,
    `## Analyse`,
    `- Titel: ${analysis.title}`,
    `- Zielgruppe: ${analysis.audience}`,
    `- Ton: ${analysis.tone}`,
    `- Zusammenfassung: ${analysis.summary}`,
    ``,
    `### Kernpunkte`,
    ...analysis.keyPoints.map((point) => `- ${point}`),
    ``,
    `### Hooks`,
    ...analysis.hooks.map((hook) => `- ${hook}`),
    ``,
    `### Risiken`,
    ...analysis.risks.map((risk) => `- ${risk}`),
    ``,
    `### SEO-Keywords`,
    analysis.seoKeywords.join(", "),
    ``,
    `## Entwurfs-Ausgaben`,
    `### LinkedIn-Post`,
    outputs.linkedinPost as string,
    ``,
    `### X-Thread`,
    ...thread.map((line) => `- ${line}`),
    ``,
    `### Blogartikel`,
    outputs.blogArticle as string,
    ``,
    `### Newsletter`,
    outputs.newsletter as string,
    ``,
    `### FAQ`,
    ...faq.map((item) => `- ${item.question} ${item.answer}`),
    ``,
    `### YouTube-Skript`,
    outputs.youtubeScript as string,
    ``,
    `### Instagram-Caption`,
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
    throw new Error("Eingabe fehlt. Bitte Dateipfad, Rohtext oder URL angeben.");
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
