import Link from "next/link";
import Juan from "@/components/Juan";
import { getLang } from "@/lib/i18n-server";
import { t as tr } from "@/lib/i18n";

export default async function NotFound() {
  const t = tr(await getLang());
  return (
    <div className="wrap" style={{ textAlign: "center", paddingTop: 48 }}>
      <Juan pose="oops" size={170} title={t.notFound.juan} />
      <h1 style={{ marginTop: 16 }}>{t.notFound.h}</h1>
      <p className="muted">{t.notFound.p}</p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/random" className="btn btn-yellow">{t.nav.random}</Link>
        <Link href="/" className="btn btn-outline">{t.nav.home}</Link>
      </div>
    </div>
  );
}
