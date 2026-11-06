import type { Metadata } from "next";
import { getLang } from "@/lib/i18n-server";
import { t as tr } from "@/lib/i18n";

export const metadata: Metadata = { title: "Privacy", alternates: { canonical: "/privacy" } };

export default async function Privacy() {
  const p = tr(await getLang()).privacy;
  return (
    <div className="wrap prose" style={{ paddingTop: 32 }}>
      <span className="route">Privacy</span>
      <h1 style={{ marginTop: ".4em" }}>Privacy policy</h1>
      <p className="muted">{p.intro}</p>
      <h2>Analytics</h2>
      <p>{p.analyticsP}</p>
      <h2>Suggest form</h2>
      <p>{p.formP}</p>
      <h2>{p.browserH}</h2>
      <p>{p.browserP}</p>
      <h2>{p.linksH}</h2>
      <p>{p.linksP}</p>
      <h2>Copyright</h2>
      <p>{p.copyP}</p>
    </div>
  );
}
