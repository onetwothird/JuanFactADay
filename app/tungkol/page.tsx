import type { Metadata } from "next";
import Link from "next/link";
import Juan from "@/components/Juan";
import { SITE } from "@/lib/util";
import { getLang } from "@/lib/i18n-server";
import { t as tr } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const t = tr(await getLang());
  return { title: t.meta.aboutTitle, description: t.meta.aboutDesc, alternates: { canonical: "/tungkol" } };
}

export default async function About() {
  const a = tr(await getLang()).about;
  return (
    <div className="wrap" style={{ paddingTop: 32 }}>
      <div style={{ display: "flex", gap: 24, alignItems: "end", flexWrap: "wrap" }}>
        <Juan pose="sign" sign={a.sign} size={190} title={a.sign} />
        <div style={{ flex: "1 1 300px" }}>
          <span className="route">{a.badge}</span>
          <h1 style={{ marginTop: ".4em" }}>
            {a.h1a}
            <span className="hl">{a.h1b}</span>
          </h1>
          <p className="muted" style={{ maxWidth: "48ch", fontSize: "1.1rem" }}>
            {a.intro}
          </p>
        </div>
      </div>
      <hr className="chrome-rule" />
      <div className="prose">
        <h2>{a.whyH}</h2>
        <p>
          {a.whyP1}
          <strong>1</strong>
          {a.whyP2}
        </p>

        <h2>{a.missionH}</h2>
        <p>{a.missionP}</p>

        <h2>{a.checkH}</h2>
        <ul>
          <li>{a.check1}</li>
          <li>{a.check2}</li>
          <li>{a.check3}</li>
          <li>
            {a.check4a}
            <Link href="/suggest">{a.check4b}</Link>
            {a.check4c}
          </li>
        </ul>

        <h2>{a.joinH}</h2>
        <ul>
          <li>
            {a.join1a}
            <Link href="/suggest">{a.join1b}</Link>
            {a.join1c}
          </li>
          <li>
            {a.join2a}
            <Link href="/quiz">{a.join2b}</Link>
            {a.join2c}
          </li>
          <li>
            {a.join3a}
            <a href={SITE.facebook} target="_blank" rel="noopener">
              Facebook
            </a>
            {a.join3b}
          </li>
        </ul>

        <h2>{a.contactH}</h2>
        <p>
          {a.contactA}
          <a href={SITE.messenger} target="_blank" rel="noopener">
            {a.contactB}
          </a>
          {a.contactC}
        </p>
      </div>
    </div>
  );
}
