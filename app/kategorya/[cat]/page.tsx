import type { Metadata } from "next";
import Link from "next/link";
import ReelShelf from "@/components/ReelShelf";
import CategoryIcon from "@/components/CategoryIcon";
import Juan from "@/components/Juan";
import { CATEGORIES, categoryOf, catLabel } from "@/lib/categories";
import { getFacts, toReel } from "@/lib/facts";
import { getLang } from "@/lib/i18n-server";
import { t as tr } from "@/lib/i18n";

export const dynamicParams = false;
export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ cat: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ cat: string }> }): Promise<Metadata> {
  const { cat } = await params;
  const lang = await getLang();
  const t = tr(lang);
  const c = categoryOf(cat);
  const name = catLabel(c, lang);
  return {
    title: t.meta.catTitle(name),
    description: t.meta.catDesc(name),
    alternates: { canonical: `/kategorya/${c.slug}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ cat: string }> }) {
  const { cat } = await params;
  const lang = await getLang();
  const t = tr(lang);
  const c = categoryOf(cat);
  const name = catLabel(c, lang);
  const facts = getFacts(lang).filter((f) => f.category === c.slug);
  return (
    <div className="wrap" style={{ paddingTop: 32 }}>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">{t.nav.home}</Link> › <Link href="/facts">{t.fact.crumbsFacts}</Link> › <span aria-current="page">{name}</span>
      </nav>
      <h1 style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <CategoryIcon slug={c.slug} size={56} /> {name}
      </h1>
      {facts.length ? (
        <div style={{ marginTop: 24 }}>
          <ReelShelf layout="grid" reels={facts.map((f) => toReel(f, lang))} />
        </div>
      ) : (
        <div className="empty">
          <Juan pose="thinking" size={150} title={t.home.juanThinking} />
          <p className="empty-title">{t.cat.none}</p>
          <Link href="/suggest" className="btn btn-yellow">{t.cat.suggest}</Link>
        </div>
      )}
    </div>
  );
}
