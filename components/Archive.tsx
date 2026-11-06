"use client";
import Fuse from "fuse.js";
import Link from "next/link";
import { useMemo, useState } from "react";
import ReelShelf, { type ReelItem } from "./ReelShelf";
import CategoryIcon from "./CategoryIcon";
import Juan from "./Juan";
import { CATEGORIES, catLabel } from "@/lib/categories";
import { useLang } from "./LangProvider";

type Item = { reel: ReelItem; category: string; search: { title: string; tags: string[]; script: string; takeaways: string[] } };
const PER_PAGE = 24;

export default function Archive({ items }: { items: Item[] }) {
  const { lang, t } = useLang();
  const a = t.archive;
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [sort, setSort] = useState<"new" | "old">("new");
  const [shown, setShown] = useState(PER_PAGE);

  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys: [
          { name: "search.title", weight: 3 },
          { name: "search.tags", weight: 2 },
          { name: "search.script", weight: 1 },
          { name: "search.takeaways", weight: 1 },
        ],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [items],
  );

  const list = useMemo(() => {
    let r = q.trim() ? fuse.search(q.trim()).map((x) => x.item) : [...items];
    if (cat) r = r.filter((f) => f.category === cat);
    if (!q.trim()) r.sort((a, b) => (sort === "new" ? b.reel.number - a.reel.number : a.reel.number - b.reel.number));
    return r;
  }, [q, cat, sort, items, fuse]);

  const used = new Set(items.map((f) => f.category));

  return (
    <>
      <div className="searchbox" role="search">
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
          <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="3" fill="none" />
          <path d="M15 15l6 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <label htmlFor="q" className="sr-only">{a.searchLabel}</label>
        <input
          id="q"
          type="search"
          placeholder={a.searchPh}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setShown(PER_PAGE);
          }}
          autoComplete="off"
          enterKeyHint="search"
        />
      </div>
      <div className="toolbar">
        <div className="chips scroll-x" role="group" aria-label={t.footer.categories}>
          <button className="chip" aria-pressed={cat === null} onClick={() => setCat(null)}>
            {a.all}
          </button>
          {CATEGORIES.filter((c) => used.has(c.slug)).map((c) => (
            <button key={c.slug} className="chip" aria-pressed={cat === c.slug} onClick={() => setCat(cat === c.slug ? null : c.slug)}>
              <CategoryIcon slug={c.slug} size={24} /> {catLabel(c, lang)}
            </button>
          ))}
        </div>
        <label className="sort-wrap">
          <span className="sr-only">{a.sortLabel}</span>
          <select className="sort" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} disabled={!!q.trim()}>
            <option value="new">{a.newest}</option>
            <option value="old">{a.oldest}</option>
          </select>
        </label>
      </div>
      <p className="muted small" aria-live="polite">
        {a.count(list.length)}
      </p>
      {list.length === 0 ? (
        <div className="empty">
          <Juan pose="oops" size={130} title={a.juanOops} />
          <p className="empty-title">{a.none}</p>
          <Link href={`/suggest?topic=${encodeURIComponent(q)}`} className="btn btn-yellow">
            {a.suggest}
          </Link>
        </div>
      ) : (
        <ReelShelf layout="grid" reels={list.slice(0, shown).map((i) => i.reel)} />
      )}
      {list.length > shown && (
        <div style={{ textAlign: "center", marginTop: 28 }}>
          <button className="btn btn-outline" onClick={() => setShown((s) => s + PER_PAGE)}>
            {a.more}
          </button>
        </div>
      )}
    </>
  );
}
