import Link from "next/link";
import Image from "next/image";
import Juan from "@/components/Juan";
import FactCard from "@/components/FactCard";
import CategoryIcon from "@/components/CategoryIcon";
import { getAllFacts, pad, SITE } from "@/lib/facts";
import { CATEGORIES, categoryOf } from "@/lib/categories";

export default function Home() {
  const facts = getAllFacts();
  const today = facts[0];
  const recent = facts.slice(0, 6);
  const usedCats = new Set(facts.map((f) => f.category));

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <div>
            <span className="route">
              <span className="dot" /> Bagong fact araw-araw
            </span>
            <h1>
              Isang kaalaman tungkol sa <span className="hl">Pilipinas</span>, <span style={{ whiteSpace: "nowrap" }}>araw-araw.</span>
            </h1>
            <p className="lead">
              Akala mo 7,107 pa rin ang isla natin? Hindi na. Si Juan ang bahala sa mga fact na hindi itinuro sa atin sa school, at may sources lahat.
            </p>
            <div className="cta">
              <Link href={`/facts/${today.slug}`} className="btn btn-yellow">
                ▶ Panoorin ang latest
              </Link>
              <Link href="/random" className="btn btn-outline">
                Random fact
              </Link>
            </div>
          </div>
          <div className="hero-juan">
            <span className="bubble left">Alam mo ba? 🤔</span>
            <Juan size={300} className="bob" />
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="route red">Fact ngayong araw · {pad(today.number)}</span>
              <h2>Ang latest kay Juan</h2>
            </div>
          </div>
          <article className="kuwaderno today">
            <Link href={`/facts/${today.slug}`} className="fcard" aria-label={today.title}>
              <div className="img">
                <Image src={today.thumbnail} alt={`Fact card: ${today.title}`} fill sizes="220px" style={{ objectFit: "cover" }} priority />
                <span className="vplay" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24"><path d="M6 3l15 9-15 9z" fill="#0A1640" /></svg>
                </span>
              </div>
            </Link>
            <div>
              <div className="muted" style={{ fontWeight: 600 }}>{categoryOf(today.category).label}</div>
              <h3 style={{ fontSize: "clamp(1.5rem, 1.2rem + 1.4vw, 2.2rem)", fontWeight: 800 }}>{today.title}</h3>
              <p>{today.script.slice(0, 2).join(" ")}</p>
              <Link href={`/facts/${today.slug}`} style={{ color: "var(--juan-red)", fontWeight: 700 }}>
                Basahin ang buong fact →
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 8 }}>
        <div className="wrap">
          <div className="sec-head">
            <h2>Mga bagong fact</h2>
            <Link href="/facts" className="btn btn-outline btn-sm">Lahat ng facts</Link>
          </div>
          <div className="grid">
            {recent.map((f) => (
              <FactCard key={f.slug} fact={f} />
            ))}
          </div>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 8 }}>
        <div className="wrap">
          <h2>Pumili ng kategorya</h2>
          <div className="chips">
            {CATEGORIES.filter((c) => usedCats.has(c.slug)).map((c) => (
              <Link key={c.slug} href={`/kategorya/${c.slug}`} className="chip">
                <CategoryIcon slug={c.slug} /> {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="panel quiz-teaser">
            <div>
              <span className="route navy">Quiz</span>
              <h2 style={{ marginTop: ".4em" }}>Ilan ang alam mo?</h2>
              <p style={{ fontWeight: 600 }}>5 tanong galing sa mga fact ni Juan. Walang login, walang pressure.</p>
              <Link href="/quiz" className="btn" style={{ background: "var(--juan-navy)", color: "#fff" }}>
                Simulan na!
              </Link>
            </div>
            <Juan pose="thinking" size={170} title="Si Juan, nag-iisip" />
          </div>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 8 }}>
        <div className="wrap">
          <h2>I-follow si Juan</h2>
          <div className="follow-strip">
            <a className="social fb" href={SITE.facebook} target="_blank" rel="noopener">
              <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden><path fill="#fff" d="M14 8h3V4h-3c-2.8 0-4 1.7-4 4.3V10H7v4h3v8h4v-8h3l1-4h-4V8.6c0-.4.3-.6.6-.6z" /></svg>
              <span>Facebook<small>Bagong Reel araw-araw, 7:30 PM</small></span>
            </a>
            <a className="social msg" href={SITE.messenger} target="_blank" rel="noopener">
              <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden><path fill="#0A1640" d="M12 2C6.5 2 2 6.1 2 11.3c0 2.9 1.4 5.5 3.7 7.2V22l3.4-1.9c.9.3 1.9.4 2.9.4 5.5 0 10-4.1 10-9.2S17.5 2 12 2zm1 12.4-2.6-2.7-5 2.7 5.5-5.8 2.6 2.7 5-2.7z" /></svg>
              <span>Messenger<small>May tanong? I-message si Juan</small></span>
            </a>
            <span className="social off">
              <span>Instagram at TikTok<small>Malapit na!</small></span>
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
