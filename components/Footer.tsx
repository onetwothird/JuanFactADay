import Link from "next/link";
import Juan from "./Juan";
import { SITE } from "@/lib/util";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="row">
          <div style={{ display: "flex", gap: 12, alignItems: "center", maxWidth: 360 }}>
            <Juan pose="peek" size={64} title="" />
            <div>
              <strong style={{ color: "#fff", fontSize: "1.1rem" }}>
                Juan Fact <span style={{ color: "var(--juan-yellow)" }}>a Day</span>
              </strong>
              <div>Isang kaalaman tungkol sa Pilipinas, araw-araw. 🇵🇭</div>
            </div>
          </div>
          <ul>
            <li><Link href="/facts">Lahat ng facts</Link></li>
            <li><Link href="/quiz">Quiz</Link></li>
            <li><Link href="/random">Random fact</Link></li>
          </ul>
          <ul>
            <li><Link href="/tungkol">Tungkol kay Juan</Link></li>
            <li><Link href="/suggest">Mag-suggest ng topic</Link></li>
            <li><Link href="/privacy">Privacy</Link></li>
          </ul>
          <ul>
            <li><a href={SITE.facebook} target="_blank" rel="noopener">Facebook</a></li>
            <li><a href={SITE.messenger} target="_blank" rel="noopener">Messenger</a></li>
            <li><a href="/rss.xml">RSS</a></li>
          </ul>
        </div>
        <small>© {new Date().getFullYear()} Juan Fact a Day. Lahat ng facts ay may sources.</small>
      </div>
    </footer>
  );
}
