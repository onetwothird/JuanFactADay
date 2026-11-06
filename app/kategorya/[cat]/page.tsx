import type { Metadata } from "next";
import Link from "next/link";
import FactCard from "@/components/FactCard";
import CategoryIcon from "@/components/CategoryIcon";
import Juan from "@/components/Juan";
import { CATEGORIES, categoryOf } from "@/lib/categories";
import { getAllFacts } from "@/lib/facts";

export const dynamicParams = false;
export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ cat: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ cat: string }> }): Promise<Metadata> {
  const { cat } = await params;
  const c = categoryOf(cat);
  return {
    title: `${c.label}: mga fact tungkol sa Pilipinas`,
    description: `Lahat ng fact ni Juan sa kategoryang ${c.label}. May sources ang bawat isa.`,
    alternates: { canonical: `/kategorya/${c.slug}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ cat: string }> }) {
  const { cat } = await params;
  const c = categoryOf(cat);
  const facts = getAllFacts().filter((f) => f.category === c.slug);
  return (
    <div className="wrap" style={{ paddingTop: 32 }}>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link> › <Link href="/facts">Facts</Link> › <span aria-current="page">{c.label}</span>
      </nav>
      <h1 style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <CategoryIcon slug={c.slug} size={56} /> {c.label}
      </h1>
      {facts.length ? (
        <div className="grid" style={{ marginTop: 24 }}>
          {facts.map((f) => (
            <FactCard key={f.slug} fact={f} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <Juan pose="thinking" size={150} title="Si Juan, nag-iisip" />
          <p style={{ fontWeight: 700, fontSize: "1.15rem" }}>Wala pang fact dito. Ginagawa pa ni Juan!</p>
          <Link href="/suggest" className="btn btn-yellow">May topic ka? I-suggest mo</Link>
        </div>
      )}
    </div>
  );
}
