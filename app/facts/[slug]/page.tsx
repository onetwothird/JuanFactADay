import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import FlipViewer from "@/components/FlipViewer";
import ShareBar from "@/components/ShareBar";
import FactCard from "@/components/FactCard";
import Juan from "@/components/Juan";
import { categoryOf } from "@/lib/categories";
import { formatDate, getAllFacts, getFact, getNeighbours, getRelated, pad, SITE } from "@/lib/facts";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllFacts().map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const f = getFact(slug);
  if (!f) return {};
  let desc = f.script.slice(0, 2).join(" ");
  if (desc.length > 155) desc = desc.slice(0, 152).replace(/\s+\S*$/, "") + "…";
  return {
    title: f.title,
    description: desc,
    alternates: { canonical: `/facts/${f.slug}` },
    openGraph: { title: f.title, description: desc, type: "article", url: `/facts/${f.slug}` },
  };
}

export default async function FactPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const f = getFact(slug);
  if (!f) notFound();
  const cat = categoryOf(f.category);
  const { prev, next } = getNeighbours(f.slug);
  const related = getRelated(f);
  const url = `${SITE.url}/facts/${f.slug}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: f.title,
      inLanguage: "fil",
      datePublished: f.published,
      dateModified: f.verified,
      image: `${SITE.url}/facts/${f.slug}/opengraph-image`,
      author: { "@type": "Organization", name: SITE.name, url: SITE.url },
      publisher: { "@type": "Organization", name: SITE.name },
      mainEntityOfPage: url,
      citation: f.sources.map((s) => s.url),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
        { "@type": "ListItem", position: 2, name: "Facts", item: `${SITE.url}/facts` },
        { "@type": "ListItem", position: 3, name: cat.label, item: `${SITE.url}/kategorya/${cat.slug}` },
        { "@type": "ListItem", position: 4, name: f.title, item: url },
      ],
    },
  ];

  return (
    <div className="wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link> › <Link href="/facts">Facts</Link> › <Link href={`/kategorya/${cat.slug}`}>{cat.label}</Link> ›{" "}
        <span aria-current="page">{f.title}</span>
      </nav>

      <div className="fact-layout">
        <aside className="stage">
          <FlipViewer cards={f.cards.length ? f.cards : [f.thumbnail]} title={f.title} videoUrl={f.links.video} />
          {f.links.facebook && (
            <p style={{ marginTop: 14, textAlign: "center" }}>
              <a href={f.links.facebook} target="_blank" rel="noopener" style={{ fontWeight: 700 }}>
                Panoorin ang Reels sa Facebook page →
              </a>
            </p>
          )}
        </aside>

        <article className="article">
          <div className="fact-head">
            <span className="route">{pad(f.number)}</span>
            <Link href={`/kategorya/${cat.slug}`} className="route navy">{cat.short}</Link>
          </div>
          <h1>{f.title}</h1>

          <section className="kwento">
            <h2 style={{ fontSize: "1.4rem" }}>Ang Kwento</h2>
            {f.paragraphs.map((t, k) => (
              <p key={`s${k}`}>{t}</p>
            ))}
            {f.extra.map((p, k) => (
              <p key={k}>{p}</p>
            ))}
          </section>

          {f.bigNumber && (
            <div className="bignum">
              <b>{f.bigNumber}</b>
              <span>{f.bigNumberLabel}</span>
            </div>
          )}

          {f.takeaways.length > 0 && (
            <section className="takeaways">
              <h2>Mabilisang Facts</h2>
              <ol>
                {f.takeaways.map((t, k) => (
                  <li key={k}>{t}</li>
                ))}
              </ol>
            </section>
          )}

          <section className="sources">
            <h2 style={{ fontSize: "1.3rem" }}>Saan galing ang fact na &apos;to?</h2>
            <ol>
              {f.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener nofollow">{s.label}</a>
                </li>
              ))}
            </ol>
          </section>

          <ShareBar url={url} title={f.title} card={f.thumbnail} />

          <p className="meta-line">
            Huling na-verify: {formatDate(f.verified)} ·{" "}
            <Link href={`/suggest?mali=${encodeURIComponent(f.title)}`}>May mali ba? Sabihan mo kami</Link>
          </p>

          <nav className="prevnext" aria-label="Iba pang facts">
            {prev && (
              <Link href={`/facts/${prev.slug}`}>
                <small>← Nakaraan</small>
                {prev.title}
              </Link>
            )}
            {next && (
              <Link href={`/facts/${next.slug}`} className="next">
                <small>Susunod →</small>
                {next.title}
              </Link>
            )}
          </nav>
        </article>
      </div>

      {related.length > 0 && (
        <section className="block">
          <h2>Baka magustuhan mo rin</h2>
          <div className="grid">
            {related.map((r) => (
              <FactCard key={r.slug} fact={r} />
            ))}
          </div>
        </section>
      )}

      <a className="peek" href={SITE.messenger} target="_blank" rel="noopener" aria-label="May tanong ka? I-message si Juan sa Messenger">
        <span className="bubble">May tanong ka? I-message mo ako!</span>
        <Juan pose="peek" size={110} title="" />
      </a>
    </div>
  );
}
