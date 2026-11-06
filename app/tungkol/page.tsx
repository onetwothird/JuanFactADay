import type { Metadata } from "next";
import Link from "next/link";
import Juan from "@/components/Juan";
import { SITE } from "@/lib/util";

export const metadata: Metadata = {
  title: "Tungkol kay Juan",
  description: "Sino si Juan, bakit may Juan Fact a Day, at paano namin chine-check ang bawat fact.",
  alternates: { canonical: "/tungkol" },
};

export default function About() {
  return (
    <div className="wrap" style={{ paddingTop: 32 }}>
      <div style={{ display: "flex", gap: 24, alignItems: "end", flexWrap: "wrap" }}>
        <Juan size={190} />
        <div style={{ flex: "1 1 300px" }}>
          <span className="route">Tungkol</span>
          <h1 style={{ marginTop: ".4em" }}>
            Ako si <span className="hl">Juan!</span>
          </h1>
          <p className="muted" style={{ maxWidth: "48ch", fontSize: "1.1rem" }}>
            Isang Pinoy na mahilig sa trivia. Araw-araw, may isang fact ako tungkol sa Pilipinas para sa&apos;yo.
          </p>
        </div>
      </div>
      <hr className="chrome-rule" />
      <div className="prose">
        <h2>Bakit &quot;Juan&quot;?</h2>
        <p>
          Galing kay Juan dela Cruz, ang karaniwang Pilipino. At oo, pun din: &quot;Juan&quot; = &quot;one&quot;. Isang fact, isang araw. Kaya
          may malaking <strong>1</strong> sa damit ko.
        </p>

        <h2>Ang misyon</h2>
        <p>Para mas makilala natin ang sariling bayan, isang fact sa isang araw. Maikli, malinaw, at totoo.</p>

        <h2>Paano namin chine-check ang facts</h2>
        <ul>
          <li>Bawat fact, sinusuri sa hindi bababa sa dalawang mapagkakatiwalaang source: government sites, encyclopedia at balita.</li>
          <li>Nakalista ang sources sa bawat fact page, sa ilalim ng &quot;Saan galing ang fact na &apos;to?&quot;</li>
          <li>Kapag kuwento lang o hindi sigurado, sinasabi namin. Halimbawa: &quot;ayon sa kwento&quot;.</li>
          <li>
            May mali? <Link href="/suggest">Sabihan mo kami</Link>. Itatama namin at ilalagay ang petsa ng correction.
          </li>
        </ul>

        <h2>Paano ginagawa ang videos</h2>
        <p>Gawa ng isang Pinoy creator gamit ang open-source tools: script, AI voice sa Filipino, at sariling drawing ni Juan.</p>

        <h2>Kontak</h2>
        <p>
          Pinakamabilis: <a href={SITE.messenger} target="_blank" rel="noopener">i-message si Juan sa Messenger</a>.
        </p>
      </div>
    </div>
  );
}
