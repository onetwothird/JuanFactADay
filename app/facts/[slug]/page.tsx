import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReelPlayer from "@/components/ReelPlayer";
import ShareBar from "@/components/ShareBar";
import ReelShelf from "@/components/ReelShelf";
import Juan from "@/components/Juan";
import { categoryOf, catLabel, catShort } from "@/lib/categories";
import { getAllFacts, getFact, getNeighbours, getRelated, pad, SITE, toReel } from "@/lib/facts";
import { getLang } from "@/lib/i18n-server";
import { formatDateIn, t as tr } from "@/lib/i18n";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllFacts().map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const lang = await getLang();
  const f = getFact(slug, lang);
  if (!f) return {};
  let desc = f.translated ? f.paragraphs[0] ?? "" : f.script.slice(0, 2).join(" ");
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
  const lang = await getLang();
  const t = tr(lang);
  const f = getFact(slug, lang);
  if (!f) notFound();
  const cat = categoryOf(f.category);
  const catName = catLabel(cat, lang);
  const { prev, next } = getNeighbours(f.slug, lang);
  const related = getRelated(f, 3, lang);
  const inLang = f.translated ? "en" : "fil";
  const url = `${SITE.url}/facts/${f.slug}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: f.title,
      inLanguage: inLang,
      datePublished: f.published,
      dateModified: f.verified,
      image: `${SITE.url}/facts/${f.slug}/opengraph-image`,
      author: { "@type": "Organization", name: SITE.name, url: SITE.url },
      publisher: { "@type": "Organization", name: SITE.name },
      mainEntityOfPage: url,
      citation: f.sources.flatMap((s) => s.urls),
    },
    ...(f.video
      ? [
          {
            "@context": "https://schema.org",
            "@type": "VideoObject",
            name: f.title,
            description: f.script.slice(0, 2).join(" "),
            thumbnailUrl: `${SITE.url}${f.poster}`,
            contentUrl: `${SITE.url}${f.video}`,
            uploadDate: f.published,
            ...(f.duration ? { duration: `PT${f.duration}S` } : {}),
            inLanguage: "fil",
          },
        ]
      : []),
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
        { "@type": "ListItem", position: 2, name: "Facts", item: `${SITE.url}/facts` },
        { "@type": "ListItem", position: 3, name: catName, item: `${SITE.url}/kategorya/${cat.slug}` },
        { "@type": "ListItem", position: 4, name: f.title, item: url },
      ],
    },
  ];

  return (
    <div className="wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">{t.nav.home}</Link> › <Link href="/facts">{t.fact.crumbsFacts}</Link> › <Link href={`/kategorya/${cat.slug}`}>{catName}</Link> ›{" "}
        <span aria-current="page">{f.title}</span>
      </nav>

      <div className="fact-layout">
        <aside className="stage">
          {f.video ? (
            <ReelPlayer src={f.video} poster={f.poster} captions={f.captions} title={f.title} />
          ) : (
            <div className="phone">
              <div className="phone-screen">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.poster} alt={t.fact.cardAlt(f.title)} />
              </div>
            </div>
          )}
          {lang === "en" && f.video && <p className="stage-note">{t.reel.videoNote}</p>}
          {f.links.facebook && (
            <a href={f.links.facebook} target="_blank" rel="noopener" className="stage-link">
              {t.fact.watchFb}
            </a>
          )}
        </aside>

        <article className="article">
          <div className="fact-head">
            <span className="route">{pad(f.number)}</span>
            <Link href={`/kategorya/${cat.slug}`} className="route navy">{catShort(cat, lang)}</Link>
          </div>
          <h1 lang={inLang}>{f.title}</h1>

          <section className="kwento" lang={inLang}>
            <div className="h-with-juan">
              <Juan pose="read" size={64} title="" />
              <h2 lang={lang}>{t.fact.story}</h2>
            </div>
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
              <h2>{t.fact.quick}</h2>
              <ol>
                {f.takeaways.map((t, k) => (
                  <li key={k}>{t}</li>
                ))}
              </ol>
            </section>
          )}

          <section className="sources">
            <div className="h-with-juan">
              <Juan pose="magnify" size={64} title="" />
              <h2>{t.fact.sources}</h2>
            </div>
            <ol>
              {f.sources.map((s, k) => (
                <li key={k}>
                  {s.label}
                  {s.urls.length > 0 && (
                    <span className="src-links">
                      {s.urls.map((u) => {
                        const url = new URL(u);
                        const host = url.hostname.replace(/^www\./, "");
                        const tail = decodeURIComponent(url.pathname.split("/").filter(Boolean).pop() ?? "").replace(/[-_]/g, " ");
                        return (
                          <a key={u} href={u} target="_blank" rel="noopener nofollow">
                            {host}
                            {tail && tail.length < 40 ? `: ${tail}` : ""}
                          </a>
                        );
                      })}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </section>

          <ShareBar url={url} title={f.title} card={f.poster} />

          <p className="meta-line">
            {t.fact.verified}: {formatDateIn(f.verified, lang)} ·{" "}
            <Link href={`/suggest?mali=${encodeURIComponent(f.title)}`}>{t.fact.report}</Link>
          </p>

          <nav className="prevnext" aria-label={t.fact.otherFacts}>
            {prev && (
              <Link href={`/facts/${prev.slug}`}>
                <small>{t.fact.prev}</small>
                {prev.title}
              </Link>
            )}
            {next && (
              <Link href={`/facts/${next.slug}`} className="next">
                <small>{t.fact.next}</small>
                {next.title}
              </Link>
            )}
          </nav>
        </article>
      </div>

      {related.length > 0 && (
        <section className="block">
          <span className="eyebrow">{t.fact.nextEyebrow}</span>
          <h2>{t.fact.related}</h2>
          <ReelShelf reels={related.map((r) => toReel(r, lang))} />
        </section>
      )}

      <a className="peek" href={SITE.messenger} target="_blank" rel="noopener" aria-label={t.fact.peekLabel}>
        <span className="bubble">{t.fact.peek}</span>
        <Juan pose="peek" size={84} title="" />
      </a>
    </div>
  );
}
