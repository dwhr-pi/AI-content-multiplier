import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { GeneratedProject, RuntimeConfig, SessionWebsiteJob, WebsitePlan } from "./types.js";

function replaceTokens(template: string, tokens: Record<string, string>): string {
  let rendered = template;
  for (const [key, value] of Object.entries(tokens)) {
    rendered = rendered.replaceAll(`{{${key}}}`, value);
  }

  return rendered;
}

async function walkTemplateFiles(baseDir: string, currentDir = ""): Promise<string[]> {
  const absolute = path.join(baseDir, currentDir);
  const entries = await readdir(absolute, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const relative = currentDir ? path.join(currentDir, entry.name) : entry.name;
    if (entry.isDirectory()) {
      files.push(...await walkTemplateFiles(baseDir, relative));
      continue;
    }

    files.push(relative);
  }

  return files;
}

function renderFeatureList(items: string[]): string {
  return items.map((item) => `- ${item}`).join("\n");
}

function buildTokens(job: SessionWebsiteJob, plan: WebsitePlan): Record<string, string> {
  return {
    PROJECT_NAME: plan.projectName,
    PROJECT_SLUG: plan.slug,
    PRODUCT_NAME: plan.productName,
    IDEA: job.idea,
    DE_HEADLINE: plan.headlineDe,
    EN_HEADLINE: plan.headlineEn,
    DE_SUBHEADLINE: plan.subheadlineDe,
    EN_SUBHEADLINE: plan.subheadlineEn,
    DE_PRIMARY_CTA: plan.primaryCtaDe,
    EN_PRIMARY_CTA: plan.primaryCtaEn,
    DE_SECONDARY_CTA: plan.secondaryCtaDe,
    EN_SECONDARY_CTA: plan.secondaryCtaEn,
    DE_FEATURE_TITLE: plan.featureTitleDe,
    EN_FEATURE_TITLE: plan.featureTitleEn,
    DE_FEATURE_ITEMS: renderFeatureList(plan.featureItemsDe),
    EN_FEATURE_ITEMS: renderFeatureList(plan.featureItemsEn),
    DE_CONTACT_HEADING: plan.contactHeadingDe,
    EN_CONTACT_HEADING: plan.contactHeadingEn,
    DE_CONTACT_BODY: plan.contactBodyDe,
    EN_CONTACT_BODY: plan.contactBodyEn,
    LEGAL_COMPANY: plan.legalCompanyPlaceholder,
    LEGAL_ADDRESS: plan.legalAddressPlaceholder,
    LEGAL_EMAIL: plan.legalEmailPlaceholder,
    AUDIENCE: plan.audience,
  };
}

function buildPreviewHtml(plan: WebsitePlan): string {
  const showDe = plan.language === "de" || plan.language === "bilingual";
  const showEn = plan.language === "en" || plan.language === "bilingual";

  return [
    "<!doctype html>",
    "<html lang=\"de\">",
    "<head>",
    "  <meta charset=\"utf-8\" />",
    "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />",
    `  <title>${plan.projectName}</title>`,
    "  <link rel=\"stylesheet\" href=\"./styles.css\" />",
    "</head>",
    "<body>",
    "  <main class=\"page\">",
    "    <section class=\"hero\">",
    `      <p class=\"eyebrow\">${plan.audience}</p>`,
    `      <h1>${showDe ? plan.headlineDe : plan.headlineEn}</h1>`,
    `      <p class=\"subheadline\">${showDe ? plan.subheadlineDe : plan.subheadlineEn}</p>`,
    "      <div class=\"actions\">",
    `        <a class=\"button primary\" href=\"#contact\">${showDe ? plan.primaryCtaDe : plan.primaryCtaEn}</a>`,
    `        <a class=\"button secondary\" href=\"#legal\">${showDe ? plan.secondaryCtaDe : plan.secondaryCtaEn}</a>`,
    "      </div>",
    "    </section>",
    "    <section class=\"grid\">",
    `      <h2>${showDe ? plan.featureTitleDe : plan.featureTitleEn}</h2>`,
    "      <div class=\"cards\">",
    ...(showDe ? plan.featureItemsDe.map((item) => `        <article class=\"card\"><p>${item}</p></article>`) : []),
    ...(showEn ? plan.featureItemsEn.map((item) => `        <article class=\"card alt\"><p>${item}</p></article>`) : []),
    "      </div>",
    "    </section>",
    "    <section class=\"contact\" id=\"contact\">",
    `      <h2>${showDe ? plan.contactHeadingDe : plan.contactHeadingEn}</h2>`,
    `      <p>${showDe ? plan.contactBodyDe : plan.contactBodyEn}</p>`,
    `      <p class=\"meta\">${plan.legalEmailPlaceholder}</p>`,
    "    </section>",
    "    <section class=\"legal\" id=\"legal\">",
    "      <h2>Impressum / Legal</h2>",
    `      <p>${plan.legalCompanyPlaceholder}</p>`,
    `      <p>${plan.legalAddressPlaceholder}</p>`,
    `      <p>${plan.legalEmailPlaceholder}</p>`,
    "      <p>Datenschutz-Platzhalter / Privacy placeholder</p>",
    "    </section>",
    "  </main>",
    "</body>",
    "</html>",
  ].join("\n");
}

function buildPreviewStyles(): string {
  return [
    ":root {",
    "  color-scheme: light;",
    "  --bg: #f4efe7;",
    "  --ink: #1d1b19;",
    "  --accent: #1d6b4f;",
    "  --accent-soft: #e4f0ea;",
    "  --line: rgba(29, 27, 25, 0.1);",
    "  font-family: 'Segoe UI', Arial, sans-serif;",
    "}",
    "* { box-sizing: border-box; }",
    "body { margin: 0; background: radial-gradient(circle at top left, #fff5df 0%, var(--bg) 48%, #f0ebe3 100%); color: var(--ink); }",
    ".page { max-width: 1120px; margin: 0 auto; padding: 40px 20px 72px; }",
    ".hero, .grid, .contact, .legal { background: rgba(255,255,255,0.72); border: 1px solid var(--line); border-radius: 28px; padding: 28px; margin-bottom: 24px; backdrop-filter: blur(8px); }",
    ".eyebrow { text-transform: uppercase; letter-spacing: 0.12em; font-size: 12px; color: var(--accent); }",
    "h1 { font-size: clamp(2.2rem, 5vw, 4.8rem); line-height: 0.95; margin: 12px 0; max-width: 12ch; }",
    "h2 { font-size: clamp(1.4rem, 2.8vw, 2rem); margin-top: 0; }",
    ".subheadline { font-size: 1.05rem; max-width: 64ch; line-height: 1.6; }",
    ".actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 20px; }",
    ".button { text-decoration: none; padding: 14px 18px; border-radius: 999px; font-weight: 600; }",
    ".button.primary { background: var(--accent); color: white; }",
    ".button.secondary { border: 1px solid var(--line); color: var(--ink); }",
    ".cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }",
    ".card { background: white; border-radius: 20px; padding: 18px; border: 1px solid var(--line); min-height: 120px; }",
    ".card.alt { background: var(--accent-soft); }",
    ".meta { color: #5d5a56; }",
    "@media (max-width: 680px) { .page { padding: 20px 14px 40px; } .hero, .grid, .contact, .legal { padding: 22px; border-radius: 20px; } }",
  ].join("\n");
}

function buildGeneratedReadme(job: SessionWebsiteJob, plan: WebsitePlan): string {
  return [
    `# ${plan.projectName}`,
    "",
    "Dieses Projekt wurde mit SessionWebsiteFactory erzeugt.",
    "",
    `- Job-ID: ${job.id}`,
    `- Template: ${job.template}`,
    `- Sprachmodus: ${job.language}`,
    `- LLM-Provider: ${plan.providerUsed}`,
    "",
    "## Idee",
    "",
    job.idea,
    "",
    "## Inhaltliche Leitplanken",
    "",
    `- Zielgruppe: ${plan.audience}`,
    `- Primare CTA: ${plan.primaryCtaDe} / ${plan.primaryCtaEn}`,
    `- Kontakt: ${plan.legalEmailPlaceholder}`,
    "",
    "## Start",
    "",
    "```bash",
    "pnpm install",
    "pnpm build",
    "pnpm dev",
    "```",
    "",
    "## Hinweise",
    "",
    "- Impressum und Datenschutz sind Platzhalter und muessen vor Produktivnutzung ersetzt werden.",
    "- Dieser Stand ist ein lokaler Prototyp und kein finaler Live-Launch.",
  ].join("\n");
}

export async function generateWebsiteProject(
  job: SessionWebsiteJob,
  plan: WebsitePlan,
  config: RuntimeConfig,
): Promise<GeneratedProject> {
  const projectRoot = path.join(job.outputDir, "project");
  const previewRoot = path.join(job.outputDir, "preview");
  const exportRoot = path.join(job.outputDir, "export");
  const templateRoot = path.join(config.templatesDir, plan.template);
  const templateFiles = await walkTemplateFiles(templateRoot);
  const tokens = buildTokens(job, plan);

  await mkdir(projectRoot, { recursive: true });
  await mkdir(previewRoot, { recursive: true });
  await mkdir(exportRoot, { recursive: true });

  for (const templateFile of templateFiles) {
    const sourcePath = path.join(templateRoot, templateFile);
    const targetRelative = templateFile.endsWith(".tpl") ? templateFile.slice(0, -4) : templateFile;
    const targetPath = path.join(projectRoot, targetRelative);
    const content = await readFile(sourcePath, "utf8");
    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, replaceTokens(content, tokens));
  }

  const planPath = path.join(job.outputDir, "plan.json");
  const readmePath = path.join(job.outputDir, "README.generated.md");
  const previewIndexPath = path.join(previewRoot, "index.html");
  const previewStylesPath = path.join(previewRoot, "styles.css");

  await writeFile(planPath, `${JSON.stringify(plan, null, 2)}\n`);
  await writeFile(readmePath, `${buildGeneratedReadme(job, plan)}\n`);
  await writeFile(previewIndexPath, `${buildPreviewHtml(plan)}\n`);
  await writeFile(previewStylesPath, `${buildPreviewStyles()}\n`);

  return {
    projectRoot,
    previewRoot,
    exportRoot,
    readmePath,
    planPath,
    previewIndexPath,
  };
}
