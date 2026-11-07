import Link from "next/link";
import Juan from "@/components/Juan";
import ReelPlayer from "@/components/ReelPlayer";
import ReelShelf from "@/components/ReelShelf";
import CategoryIcon from "@/components/CategoryIcon";
import { getFacts, pad, SITE, toReel } from "@/lib/facts";
import { CATEGORIES, catLabel } from "@/lib/categories";
import { getLang } from "@/lib/i18n-server";
import { t as tr } from "@/lib/i18n";

export default async function Home() {
  const lang = await getLang();
  const t = tr(lang);
  const h = t.home;
  const facts = getFacts(lang);
  const latest = facts.find((f) => f.video) ?? facts[0];
  const used = new Set(facts.map((f) => f.category));
  const ticker = [h.ticker[0], h.ticker[1], ...facts.slice(0, 6).map((f) => f.title), h.ticker[2], h.ticker[3]];

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <span className="route">
              <span className="dot" /> {h.badge}
            </span>
            <h1>
              {h.h1a}
              <span className="hl">{h.h1b}</span>, <span className="nowrap">{h.h1c}</span>
            </h1>
            <p className="lead">
              {h.lead}
            </p>
            <div className="cta">
              <Link href={`/facts/${latest.slug}`} className="btn btn-yellow">
                {h.watchLatest}
              </Link>
              <a href={SITE.facebook} target="_blank" rel="noopener" className="btn btn-outline">
                {t.nav.followFb}
              </a>
            </div>
          </div>

          <div className="hero-stage">
            <div className="hero-juan">
              <span className="bubble">{h.bubble}</span>
              <Juan pose="wave" size={210} className="bob" title={h.juanWave} />
            </div>
            {latest.video && (
              <figure className="hero-reel">
                <span className="route red hero-reel-badge">{t.reel.latest} · {pad(latest.number)}</span>
                <ReelPlayer src={latest.video} poster={latest.poster} captions={latest.captions} title={latest.title} ambient />
                <figcaption>
                  <Link href={`/facts/${latest.slug}`}>{latest.title} →</Link>
                </figcaption>
              </figure>
            )}
          </div>
        </div>
      </section>

      {/* ---------- jeepney signboard ticker ---------- */}
      <div className="ticker-wrap" aria-hidden>
      <div className="ticker">
        <div className="ticker-track">
          {[...ticker, ...ticker].map((t, i) => (
            <span key={i}>
              {t} <i>★</i>
            </span>
          ))}
        </div>
      </div>
      </div>

      {/* ---------- REELS ---------- */}
      <section className="block">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">{h.reelsEyebrow}</span>
              <h2>{h.reelsH}</h2>
            </div>
            <Link href="/facts" className="btn btn-outline btn-sm">
              {h.allReels}
            </Link>
          </div>
          <ReelShelf reels={facts.map((f) => toReel(f, lang))} />
        </div>
      </section>

      {/* ---------- FORMAT (komiks strip) ---------- */}
      <section className="block">
        <div className="wrap">
          <span className="eyebrow">{h.howEyebrow}</span>
          <h2>{h.howH}</h2>
          <div className="komiks" role="list">
            <div className="panel-k k1" role="listitem">
              <span className="k-num" aria-hidden>1</span>
              <Juan pose="thinking" size={120} title="" />
              <div>
                <h3>{h.k1h}</h3>
                <p>{h.k1p}</p>
              </div>
            </div>
            <div className="panel-k k2" role="listitem">
              <span className="k-num" aria-hidden>2</span>
              <Juan pose="read" size={120} title="" />
              <div>
                <h3>{h.k2h}</h3>
                <p>{h.k2p}</p>
              </div>
            </div>
            <div className="panel-k k3" role="listitem">
              <span className="k-num" aria-hidden>3</span>
              <Juan pose="excited" size={120} title="" />
              <div>
                <h3>{h.k3h}</h3>
                <p>{h.k3p}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FACT-CHECK + CATEGORIES ---------- */}
      <section className="block">
        <div className="wrap split">
          <div className="check-card">
            <Juan pose="magnify" size={170} title={h.juanMagnify} />
            <div>
              <span className="eyebrow dark">{h.checkEyebrow}</span>
              <h2>{h.checkH}</h2>
              <p>{h.checkP}</p>
              <Link href="/tungkol" className="link-strong">
                {h.checkLink}
              </Link>
            </div>
          </div>
          <div>
            <span className="eyebrow">{h.catEyebrow}</span>
            <h2>{h.catH}</h2>
            <div className="chips">
              {CATEGORIES.map((c) => (
                <Link key={c.slug} href={`/kategorya/${c.slug}`} className={`chip ${used.has(c.slug) ? "" : "soon"}`}>
                  <CategoryIcon slug={c.slug} /> {catLabel(c, lang)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- QUIZ ---------- */}
      <section className="block">
        <div className="wrap">
          <div className="panel quiz-teaser">
            <div>
              <span className="route navy">Quiz</span>
              <h2>{h.quizH}</h2>
              <p>{h.quizP}</p>
              <Link href="/quiz" className="btn btn-navy">
                {h.quizCta}
              </Link>
            </div>
            <Juan pose="thinking" size={150} title={h.juanThinking} />
          </div>
        </div>
      </section>

      {/* ---------- FOLLOW ---------- */}
      <section className="block">
        <div className="wrap">
          <div className="follow-card">
            <div className="follow-copy">
              <span className="route navy">
                <span className="dot" /> {h.followBadge}
              </span>
              <h2>
                {h.followHa}
                <span className="nowrap">{h.followHb}</span>
              </h2>
              <p>{h.followP}</p>
              <div className="follow-actions">
                <a className="btn btn-fb" href={SITE.facebook} target="_blank" rel="noopener">
                  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
                    <path fill="currentColor" d="M14 8h3V4h-3c-2.8 0-4 1.7-4 4.3V10H7v4h3v8h4v-8h3l1-4h-4V8.6c0-.4.3-.6.6-.6z" />
                  </svg>
                  {t.nav.followFb}
                </a>
                <a className="btn btn-white" href={SITE.messenger} target="_blank" rel="noopener">
                  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
                    <path fill="currentColor" d="M12 2C6.5 2 2 6.1 2 11.3c0 2.9 1.4 5.5 3.7 7.2V22l3.4-1.9c.9.3 1.9.4 2.9.4 5.5 0 10-4.1 10-9.2S17.5 2 12 2zm1 12.4-2.6-2.7-5 2.7 5.5-5.8 2.6 2.7 5-2.7z" />
                  </svg>
                  {t.nav.messageJuan}
                </a>
                <a className="btn btn-ig" href={SITE.instagram} target="_blank" rel="noopener">
                  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
                    <rect x="3" y="3" width="18" height="18" rx="5.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
                    <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="2.2" />
                    <circle cx="17.3" cy="6.7" r="1.3" fill="currentColor" />
                  </svg>
                  Instagram
                </a>
                <a className="btn btn-tt" href={SITE.tiktok} target="_blank" rel="noopener">
                  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
                    <path fill="currentColor" d="M16.6 2h-3.4v13.3a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9a6.4 6.4 0 1 0 5.4 6.3V8.6a7.6 7.6 0 0 0 4.4 1.4V6.6a4.4 4.4 0 0 1-4.4-4.6z" />
                  </svg>
                  TikTok
                </a>
              </div>
            </div>
            <Juan pose="sign" sign={h.sign} size={230} title={h.juanSign} className="follow-juan" />
          </div>
        </div>
      </section>
    </>
  );
}
