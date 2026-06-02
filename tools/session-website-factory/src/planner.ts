import type { RuntimeConfig, SessionWebsiteJob, WebsitePlan } from "./types.js";

function normalizeWhitespace(value: string): string {
  return value.replace(/\r/g, "").replace(/\s+/g, " ").trim();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "session-website";
}

function parseJsonBlock<T>(value: string): T | null {
  const fenced = value.match(/```json\s*([\s\S]+?)```/i)?.[1];
  const candidate = fenced ?? value;
  try {
    return JSON.parse(candidate) as T;
  } catch {
    return null;
  }
}

function sentenceCase(value: string): string {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function fallbackPlan(job: SessionWebsiteJob): WebsitePlan {
  const cleanedIdea = normalizeWhitespace(job.idea);
  const slug = job.slug || slugify(job.projectName);
  const productName = sentenceCase(job.projectName || cleanedIdea.split(" ").slice(0, 3).join(" "));

  return {
    projectName: productName,
    slug,
    template: job.template,
    language: job.language,
    providerUsed: "fallback",
    audience: "Teams, Solo-Builder und Betreiber im Ultimate-KI-Setup",
    productName,
    headlineDe: `${productName}: vom Konzept zur lokalen Website in einem kontrollierten Ablauf`,
    headlineEn: `${productName}: from idea to local website in a controlled workflow`,
    subheadlineDe: `${cleanedIdea}. Die Seite ist fuer lokale Ausfuehrung, schnelle Iteration und spaetere Automatisierung ausgelegt.`,
    subheadlineEn: `${cleanedIdea}. The site is designed for local execution, fast iteration and later automation.`,
    primaryCtaDe: "Demo anfragen",
    primaryCtaEn: "Request a demo",
    secondaryCtaDe: "Technik ansehen",
    secondaryCtaEn: "View the stack",
    featureTitleDe: "Warum dieses Setup funktioniert",
    featureTitleEn: "Why this setup works",
    featureItemsDe: [
      "Lokale Ausfuehrung mit optionaler Cloud-Erweiterung",
      "Klare CTA-Fuehrung fuer Marketing- oder Produktseiten",
      "Sauber vorbereitete Basis fuer spaetere OpenClaw- oder n8n-Integration",
    ],
    featureItemsEn: [
      "Local-first execution with optional cloud extensions",
      "Clear CTA structure for marketing or product pages",
      "Prepared foundation for later OpenClaw or n8n integration",
    ],
    contactHeadingDe: "Kontakt und naechster Schritt",
    contactHeadingEn: "Contact and next step",
    contactBodyDe: "Nutze diesen Bereich fuer Kontaktformular, Terminlink oder Vertriebs-E-Mail.",
    contactBodyEn: "Use this section for a contact form, meeting link or sales email.",
    legalCompanyPlaceholder: "Unternehmensname Platzhalter GmbH",
    legalAddressPlaceholder: "Musterstrasse 1, 12345 Musterstadt",
    legalEmailPlaceholder: "kontakt@example.com",
    notes: [
      "Fallback-Plan genutzt, weil kein externer LLM-Provider zwingend vorausgesetzt wird.",
      "Anthropic- oder Claude-Konfigurationen werden absichtlich ignoriert.",
    ],
  };
}

function buildPrompt(job: SessionWebsiteJob): string {
  return [
    "Erzeuge einen kompakten JSON-Websiteplan.",
    "Antwortformat: reines JSON ohne Erklaertext.",
    `Idee: ${job.idea}`,
    `Projektname: ${job.projectName}`,
    `Template: ${job.template}`,
    `Sprache: ${job.language}`,
    "Felder: audience, headlineDe, headlineEn, subheadlineDe, subheadlineEn, primaryCtaDe, primaryCtaEn, secondaryCtaDe, secondaryCtaEn, featureTitleDe, featureTitleEn, featureItemsDe, featureItemsEn, contactHeadingDe, contactHeadingEn, contactBodyDe, contactBodyEn, legalCompanyPlaceholder, legalAddressPlaceholder, legalEmailPlaceholder, notes.",
    "Fokus: Landingpage oder Website fuer lokales KI- oder Automationsprodukt.",
    "Keine Claude- oder Anthropic-Empfehlungen.",
  ].join("\n");
}

async function callOllama(prompt: string, config: RuntimeConfig): Promise<string | null> {
  const response = await fetch(`${config.ollamaBaseUrl.replace(/\/$/, "")}/api/generate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model: config.ollamaModel,
      prompt,
      stream: false,
      options: {
        temperature: 0.2,
      },
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { response?: string };
  return data.response ?? null;
}

async function callOpenAi(prompt: string, config: RuntimeConfig): Promise<string | null> {
  if (!config.openAiApiKey) {
    return null;
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${config.openAiApiKey}`,
    },
    body: JSON.stringify({
      model: config.openAiModel,
      temperature: 0.2,
      messages: [
        { role: "system", content: "You are a structured website planner. Return JSON only." },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content ?? null;
}

async function callGemini(prompt: string, config: RuntimeConfig): Promise<string | null> {
  if (!config.geminiApiKey) {
    return null;
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.geminiModel)}:generateContent?key=${encodeURIComponent(config.geminiApiKey)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `${prompt}\nJSON only.` }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
        },
      }),
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("\n") ?? null;
}

async function callProvider(job: SessionWebsiteJob, config: RuntimeConfig): Promise<{ provider: WebsitePlan["providerUsed"]; text: string | null }> {
  const prompt = buildPrompt(job);

  if (config.provider === "ollama") {
    return { provider: "ollama", text: await callOllama(prompt, config) };
  }

  if (config.provider === "openai") {
    return { provider: "openai", text: await callOpenAi(prompt, config) };
  }

  if (config.provider === "gemini") {
    return { provider: "gemini", text: await callGemini(prompt, config) };
  }

  if (config.provider === "openclaw") {
    return {
      provider: "openclaw",
      text: null,
    };
  }

  return { provider: "fallback", text: null };
}

export async function buildWebsitePlan(
  job: SessionWebsiteJob,
  config: RuntimeConfig,
): Promise<WebsitePlan> {
  const fallback = fallbackPlan(job);
  const providerResult = await callProvider(job, config).catch(() => ({ provider: "fallback" as const, text: null }));
  const parsed = providerResult.text ? parseJsonBlock<Partial<WebsitePlan>>(providerResult.text) : null;

  if (!parsed) {
    return fallback;
  }

  return {
    ...fallback,
    ...parsed,
    projectName: parsed.projectName ?? fallback.projectName,
    slug: parsed.slug ?? fallback.slug,
    template: parsed.template ?? fallback.template,
    language: parsed.language ?? fallback.language,
    providerUsed: providerResult.provider,
    featureItemsDe: parsed.featureItemsDe ?? fallback.featureItemsDe,
    featureItemsEn: parsed.featureItemsEn ?? fallback.featureItemsEn,
    notes: [...fallback.notes, ...(parsed.notes ?? [])],
  };
}
