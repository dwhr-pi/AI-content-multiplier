const featureItemsDe = `{{DE_FEATURE_ITEMS}}`.split("\\n").filter(Boolean);
const featureItemsEn = `{{EN_FEATURE_ITEMS}}`.split("\\n").filter(Boolean);

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-8 md:px-6 md:py-10">
      <section className="grid gap-8 rounded-[2rem] border border-black/10 bg-white/75 p-8 backdrop-blur md:grid-cols-[1.4fr_0.9fr] md:p-12">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-800">{{AUDIENCE}}</p>
          <h1 className="max-w-[12ch] text-5xl font-black leading-none md:text-7xl">{{DE_HEADLINE}}</h1>
          <p className="max-w-2xl text-lg leading-8 text-neutral-700">{{DE_SUBHEADLINE}}</p>
          <div className="flex flex-wrap gap-3">
            <a className="rounded-full bg-emerald-800 px-5 py-3 text-sm font-semibold text-white" href="#kontakt">{{DE_PRIMARY_CTA}}</a>
            <a className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-900" href="#legal">{{DE_SECONDARY_CTA}}</a>
          </div>
        </div>
        <div className="rounded-[1.75rem] border border-neutral-200 bg-white/90 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">English companion</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight">{{EN_HEADLINE}}</h2>
          <p className="mt-4 text-base leading-7 text-neutral-700">{{EN_SUBHEADLINE}}</p>
        </div>
      </section>

      <section className="grid gap-6 rounded-[2rem] border border-black/10 bg-white/75 p-8 backdrop-blur md:grid-cols-2 md:p-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">Deutsch</p>
          <h2 className="mt-3 text-3xl font-bold">{{DE_FEATURE_TITLE}}</h2>
          <ul className="mt-5 space-y-3 text-neutral-700">
            {featureItemsDe.map((item) => <li key={item}>{item.replace(/^-\\s*/, "")}</li>)}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">English</p>
          <h2 className="mt-3 text-3xl font-bold">{{EN_FEATURE_TITLE}}</h2>
          <ul className="mt-5 space-y-3 text-neutral-700">
            {featureItemsEn.map((item) => <li key={item}>{item.replace(/^-\\s*/, "")}</li>)}
          </ul>
        </div>
      </section>

      <section id="kontakt" className="grid gap-6 rounded-[2rem] border border-black/10 bg-white/75 p-8 backdrop-blur md:grid-cols-2 md:p-10">
        <div>
          <h2 className="text-3xl font-bold">{{DE_CONTACT_HEADING}}</h2>
          <p className="mt-4 text-neutral-700">{{DE_CONTACT_BODY}}</p>
          <p className="mt-6 text-sm text-neutral-500">{{LEGAL_EMAIL}}</p>
        </div>
        <div>
          <h2 className="text-3xl font-bold">{{EN_CONTACT_HEADING}}</h2>
          <p className="mt-4 text-neutral-700">{{EN_CONTACT_BODY}}</p>
          <p className="mt-6 text-sm text-neutral-500">{{LEGAL_COMPANY}}</p>
        </div>
      </section>

      <section id="legal" className="rounded-[2rem] border border-black/10 bg-white/75 p-8 backdrop-blur md:p-10">
        <h2 className="text-2xl font-bold">Impressum / Datenschutz</h2>
        <p className="mt-4 text-neutral-700">{{LEGAL_COMPANY}}</p>
        <p className="text-neutral-700">{{LEGAL_ADDRESS}}</p>
        <p className="text-neutral-700">{{LEGAL_EMAIL}}</p>
        <p className="mt-4 text-sm text-neutral-500">Vor Livegang bitte rechtlich vollstaendig ersetzen.</p>
      </section>
    </main>
  );
}
