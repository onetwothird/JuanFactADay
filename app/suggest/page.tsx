import type { Metadata } from "next";
import { Suspense } from "react";
import SuggestForm from "@/components/SuggestForm";
import { SITE } from "@/lib/util";
import { getLang } from "@/lib/i18n-server";
import { t as tr } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const t = tr(await getLang());
  return { title: t.meta.suggestTitle, description: t.meta.suggestDesc, alternates: { canonical: "/suggest" } };
}

export default async function SuggestPage() {
  const t = tr(await getLang());
  return (
    <div className="wrap" style={{ paddingTop: 32 }}>
      <span className="route">{t.suggest.badge}</span>
      <h1 style={{ marginTop: ".4em" }}>
        {t.suggest.h1a}
        <span className="hl">{t.suggest.h1b}</span>
      </h1>
      <p className="muted" style={{ maxWidth: "52ch" }}>
        {t.suggest.intro}
      </p>
      <Suspense>
        <SuggestForm formspreeId={SITE.formspree} messenger={SITE.messenger} />
      </Suspense>
    </div>
  );
}
