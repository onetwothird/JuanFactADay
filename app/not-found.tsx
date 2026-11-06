import Link from "next/link";
import Juan from "@/components/Juan";

export default function NotFound() {
  return (
    <div className="wrap" style={{ textAlign: "center", paddingTop: 48 }}>
      <Juan pose="thinking" size={200} title="Si Juan, nag-iisip" />
      <h1 style={{ marginTop: 16 }}>Hala, wala dito &apos;yan! 🤔</h1>
      <p className="muted">Baka naligaw ka. Subukan mo &apos;to:</p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/random" className="btn btn-yellow">Random fact</Link>
        <Link href="/" className="btn btn-outline">Home</Link>
      </div>
    </div>
  );
}
