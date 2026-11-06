import type { Metadata } from "next";
import Archive from "@/components/Archive";
import Juan from "@/components/Juan";
import { getFacts, toReel } from "@/lib/facts";
import { getLang } from "@/lib/i18n-server";
import { t as tr } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const t = tr(await getLang());
  return { title: t.meta.factsTitle, description: t.meta.factsDesc, alternates: { canonical: "/facts" } };
}

export default async function FactsPage() {
  const lang = await getLang();
  const t = tr(lang);
  const facts = getFacts(lang);
  const items = facts.map((f) => ({
    reel: toReel(f, lang),
    category: f.category,
    search: { title: f.title, tags: f.tags, script: (f.translated ? f.paragraphs : f.script).join(" "), takeaways: f.takeaways },
  }));
  return (
    <>
      <section className="page-head">
        <div className="wrap page-head-grid">
          <div>
            <span className="route">{t.archive.badge}</span>
            <h1>
              {t.archive.h1a}
              <span className="hl">{t.archive.h1b}</span>
              {t.archive.h1c}
            </h1>
            <p className="lead">{t.archive.lead}</p>
          </div>
          <Juan pose="read" size={150} title={t.archive.juanRead} className="page-head-juan" />
        </div>
      </section>
      <div className="wrap">
        <Archive items={items} />
      </div>
    </>
  );
}
