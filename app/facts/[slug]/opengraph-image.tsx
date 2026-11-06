import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";
import { getAllFacts, getFact, pad } from "@/lib/facts";
import { categoryOf } from "@/lib/categories";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Juan Fact a Day";

export function generateStaticParams() {
  return getAllFacts().map((f) => ({ slug: f.slug }));
}

export default async function OG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const f = getFact(slug)!;
  const card = fs.readFileSync(path.join(process.cwd(), "public", f.thumbnail));
  const juan = fs.readFileSync(path.join(process.cwd(), "public", "juan", "juan_mascot.png"));
  const src = (b: Buffer, t: string) => `data:${t};base64,${b.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0F1A3C", color: "#fff", fontFamily: "sans-serif", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", background: "radial-gradient(circle at 80% 70%, #2B4DB8 0%, #1E3A8A 35%, #0F1A3C 75%)" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 0 0 70px", width: 760, position: "relative" }}>
          <div style={{ display: "flex", gap: 14 }}>
            <div style={{ display: "flex", background: "#FFC72C", color: "#0F1A3C", fontSize: 28, fontWeight: 800, padding: "8px 18px", borderRadius: 8, border: "3px solid #0A1640" }}>{pad(f.number)}</div>
            <div style={{ display: "flex", background: "#0A1640", color: "#FFC72C", fontSize: 28, fontWeight: 800, padding: "8px 18px", borderRadius: 8 }}>{categoryOf(f.category).short}</div>
          </div>
          <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.05, marginTop: 28 }}>{f.title}</div>
          <div style={{ fontSize: 30, color: "#DCE6FF", marginTop: 24, display: "flex" }}>
            Juan Fact <span style={{ color: "#FFC72C", marginLeft: 10 }}>a Day</span>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src(card, "image/jpeg")} width={300} height={533} style={{ position: "absolute", right: 70, top: 48, borderRadius: 18, border: "5px solid #0A1640", transform: "rotate(3deg)" }} alt="" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src(juan, "image/png")} width={190} height={222} style={{ position: "absolute", right: 300, bottom: -40 }} alt="" />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 14, display: "flex" }}>
          <div style={{ flex: 1, background: "#0038A8" }} />
          <div style={{ flex: 1, background: "#D7263D" }} />
          <div style={{ flex: 1, background: "#FFC72C" }} />
        </div>
      </div>
    ),
    size,
  );
}
