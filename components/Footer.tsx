import Link from "next/link";
import Juan from "./Juan";
import CategoryIcon from "./CategoryIcon";
import { SITE } from "@/lib/util";
import { getFacts } from "@/lib/facts";
import { CATEGORIES, catLabel } from "@/lib/categories";
import { getLang } from "@/lib/i18n-server";
import { t as tr } from "@/lib/i18n";

export default async function Footer() {
  const lang = await getLang();
  const t = tr(lang);
  const facts = getFacts(lang);
  const used = CATEGORIES.filter((c) => facts.some((f) => f.category === c.slug));
  const latest = facts.slice(0, 3);
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="foot-cta">
          <Juan pose="wave" size={96} title="" className="foot-juan" />
          <div className="foot-cta-text">
            <strong>{t.footer.ctaStrong}</strong>
            <span>{t.footer.ctaSub}</span>
          </div>
          <div className="foot-cta-btns">
            <a className="btn btn-fb btn-sm" href={SITE.facebook} target="_blank" rel="noopener">
              {t.nav.followFb}
            </a>
            <a className="btn btn-white btn-sm" href={SITE.messenger} target="_blank" rel="noopener">
              Messenger
            </a>
            <a className="btn btn-ig btn-sm" href={SITE.instagram} target="_blank" rel="noopener">
              Instagram
            </a>
            <a className="btn btn-tt btn-sm" href={SITE.tiktok} target="_blank" rel="noopener">
              TikTok
            </a>
          </div>
        </div>

        <div className="foot-grid">
          <div className="foot-brand">
            <Link href="/" className="foot-logo">
              Juan Fact <span>a Day</span>
            </Link>
            <p>{t.footer.blurb}</p>
          </div>

          <nav aria-label={t.footer.watch}>
            <h2>{t.footer.watch}</h2>
            <ul>
              <li><Link href="/facts">{t.footer.allReels}</Link></li>
              {latest.map((f) => (
                <li key={f.slug}>
                  <Link href={`/facts/${f.slug}`}>{f.title}</Link>
                </li>
              ))}
              <li><Link href="/random">{t.nav.random}</Link></li>
            </ul>
          </nav>

          <nav aria-label={t.footer.categoriesLabel}>
            <h2>{t.footer.categories}</h2>
            <ul>
              {used.map((c) => (
                <li key={c.slug}>
                  <Link href={`/kategorya/${c.slug}`} className="foot-cat">
                    <CategoryIcon slug={c.slug} size={20} /> {catLabel(c, lang)}
                  </Link>
                </li>
              ))}
              <li><Link href="/quiz">{t.footer.quizLink}</Link></li>
            </ul>
          </nav>

          <nav aria-label={t.nav.about}>
            <h2>Juan Fact a Day</h2>
            <ul>
              <li><Link href="/tungkol">{t.footer.aboutJuan}</Link></li>
              <li><Link href="/suggest">{t.nav.suggest}</Link></li>
              <li><Link href="/privacy">Privacy</Link></li>
              <li><a href="/rss.xml">RSS feed</a></li>
            </ul>
          </nav>
        </div>

        <div className="foot-bottom">
          <span>© {year} Juan Fact a Day · {t.footer.rights}</span>
          <span className="foot-ph">{t.footer.made} 🇵🇭</span>
          <a href="#top" className="to-top">
            {t.footer.toTop}
          </a>
        </div>
      </div>
    </footer>
  );
}
