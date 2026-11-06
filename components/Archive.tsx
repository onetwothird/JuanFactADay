"use client";
import Fuse from "fuse.js";
import Link from "next/link";
import { useMemo, useState } from "react";
import FactCard from "./FactCard";
import CategoryIcon from "./CategoryIcon";
import { CATEGORIES } from "@/lib/categories";
import type { Fact } from "@/lib/facts";

const PER_PAGE = 24;

export default function Archive({ facts }: { facts: Fact[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [sort, setSort] = useState<"new" | "old" | "random">("new");
  const [shown, setShown] = useState(PER_PAGE);
  const [seed] = useState(() => Math.random());

  const fuse = useMemo(
    () =>
      new Fuse(facts, {
        keys: [
          { name: "title", weight: 3 },
          { name: "tags", weight: 2 },
          { name: "script", weight: 1 },
          { name: "takeaways", weight: 1 },
        ],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [facts],
  );

  const list = useMemo(() => {
    let r = q.trim() ? fuse.search(q.trim()).map((x) => x.item) : [...facts];
    if (cat) r = r.filter((f) => f.category === cat);
    if (!q.trim()) {
      if (sort === "new") r.sort((a, b) => b.number - a.number);
      if (sort === "old") r.sort((a, b) => a.number - b.number);
      if (sort === "random") r.sort((a, b) => ((a.number * 9301 + seed * 49297) % 233) - ((b.number * 9301 + seed * 49297) % 233));
    }
    return r;
  }, [q, cat, sort, facts, fuse, seed]);

  const used = new Set(facts.map((f) => f.category));

  return (
    <>
      <div className="searchbox" role="search">
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden><circle cx="10" cy="10" r="7" stroke="#0A1640" strokeWidth="3" fill="none" /><path d="M15 15l6 6" stroke="#0A1640" strokeWidth="3" strokeLinecap="round" /></svg>
        <label htmlFor="q" className="sr-only">Maghanap ng fact</label>
        <input id="q" type="search" placeholder="Maghanap ng fact… (hal. jeepney, Rizal, isla)" value={q} onChange={(e) => { setQ(e.target.value); setShown(PER_PAGE); }} autoComplete="off" />
      </div>
      <div className="toolbar">
        <div className="chips" role="group" aria-label="Kategorya">
          <button className="chip" aria-pressed={cat === null} onClick={() => setCat(null)} style={{ paddingLeft: 16 }}>Lahat</button>
          {CATEGORIES.filter((c) => used.has(c.slug)).map((c) => (
            <button key={c.slug} className="chip" aria-pressed={cat === c.slug} onClick={() => setCat(cat === c.slug ? null : c.slug)}>
              <CategoryIcon slug={c.slug} size={26} /> {c.label}
            </button>
          ))}
        </div>
        <label>
          <span className="sr-only">Ayusin ayon sa</span>
          <select className="sort" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} disabled={!!q.trim()}>
            <option value="new">Pinakabago</option>
            <option value="old">Pinakaluma</option>
            <option value="random">Random</option>
          </select>
        </label>
      </div>
      <p className="muted" aria-live="polite" style={{ fontSize: ".95rem" }}>
        {list.length} {list.length === 1 ? "fact" : "facts"}
      </p>
      {list.length === 0 ? (
        <div className="empty">
          <p style={{ fontWeight: 700, fontSize: "1.2rem" }}>Wala pa tayong fact tungkol diyan.</p>
          <Link href={`/suggest?topic=${encodeURIComponent(q)}`} className="btn btn-yellow">I-suggest mo!</Link>
        </div>
      ) : (
        <div className="grid">
          {list.slice(0, shown).map((f) => (
            <FactCard key={f.slug} fact={f} />
          ))}
        </div>
      )}
      {list.length > shown && (
        <div style={{ textAlign: "center", marginTop: 28 }}>
          <button className="btn btn-outline" onClick={() => setShown((s) => s + PER_PAGE)}>Mag-load pa</button>
        </div>
      )}
    </>
  );
}
