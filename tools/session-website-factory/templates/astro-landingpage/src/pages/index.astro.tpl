---
import BaseLayout from "../layouts/BaseLayout.astro";
---

<BaseLayout title="{{PROJECT_NAME}}">
  <main class="mx-auto flex max-w-6xl flex-col gap-6">
    <section class="hero-card grid gap-8 p-8 md:grid-cols-[1.4fr_0.9fr] md:p-12">
      <div class="space-y-6">
        <p class="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-800">{{AUDIENCE}}</p>
        <h1 class="max-w-[12ch] text-5xl font-black leading-none md:text-7xl">{{DE_HEADLINE}}</h1>
        <p class="max-w-2xl text-lg leading-8 text-neutral-700">{{DE_SUBHEADLINE}}</p>
        <div class="flex flex-wrap gap-3">
          <a class="rounded-full bg-emerald-800 px-5 py-3 text-sm font-semibold text-white no-underline" href="#kontakt">{{DE_PRIMARY_CTA}}</a>
          <a class="rounded-full border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-900 no-underline" href="#legal">{{DE_SECONDARY_CTA}}</a>
        </div>
      </div>
      <div class="rounded-[1.75rem] border border-neutral-200 bg-white/80 p-6">
        <p class="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">English companion</p>
        <h2 class="mt-3 text-3xl font-bold leading-tight">{{EN_HEADLINE}}</h2>
        <p class="mt-4 text-base leading-7 text-neutral-700">{{EN_SUBHEADLINE}}</p>
      </div>
    </section>

    <section class="content-card grid gap-6 p-8 md:grid-cols-2 md:p-10">
      <div>
        <p class="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">Deutsch</p>
        <h2 class="mt-3 text-3xl font-bold">{{DE_FEATURE_TITLE}}</h2>
        <div class="mt-5 whitespace-pre-line text-neutral-700">{{DE_FEATURE_ITEMS}}</div>
      </div>
      <div>
        <p class="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">English</p>
        <h2 class="mt-3 text-3xl font-bold">{{EN_FEATURE_TITLE}}</h2>
        <div class="mt-5 whitespace-pre-line text-neutral-700">{{EN_FEATURE_ITEMS}}</div>
      </div>
    </section>

    <section id="kontakt" class="content-card grid gap-6 p-8 md:grid-cols-2 md:p-10">
      <div>
        <h2 class="text-3xl font-bold">{{DE_CONTACT_HEADING}}</h2>
        <p class="mt-4 text-neutral-700">{{DE_CONTACT_BODY}}</p>
        <p class="mt-6 text-sm text-neutral-500">{{LEGAL_EMAIL}}</p>
      </div>
      <div>
        <h2 class="text-3xl font-bold">{{EN_CONTACT_HEADING}}</h2>
        <p class="mt-4 text-neutral-700">{{EN_CONTACT_BODY}}</p>
        <p class="mt-6 text-sm text-neutral-500">{{LEGAL_COMPANY}}</p>
      </div>
    </section>

    <section id="legal" class="legal-card p-8 md:p-10">
      <h2 class="text-2xl font-bold">Impressum / Datenschutz</h2>
      <p class="mt-4 text-neutral-700">{{LEGAL_COMPANY}}</p>
      <p class="text-neutral-700">{{LEGAL_ADDRESS}}</p>
      <p class="text-neutral-700">{{LEGAL_EMAIL}}</p>
      <p class="mt-4 text-sm text-neutral-500">Vor Livegang bitte rechtlich vollstaendig ersetzen.</p>
    </section>
  </main>
</BaseLayout>
