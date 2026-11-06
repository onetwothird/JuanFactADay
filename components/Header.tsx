"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Juan from "./Juan";
import ThemeToggle from "./ThemeToggle";
import LangToggle from "./LangToggle";
import { useLang } from "./LangProvider";

const FB = "https://www.facebook.com/juanfactaday";
const MSG = "https://m.me/juanfactaday";


export default function Header() {
  const path = usePathname();
  const { t } = useLang();
  const NAV = [
    { href: "/", label: t.nav.home },
    { href: "/facts", label: t.nav.reels },
    { href: "/quiz", label: t.nav.quiz },
    { href: "/tungkol", label: t.nav.about },
  ];
  const MORE = [
    { href: "/random", label: t.nav.random },
    { href: "/suggest", label: t.nav.suggest },
  ];
  const [follow, setFollow] = useState(false);
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const followRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close menus on navigation
  useEffect(() => {
    setMenu(false);
    setFollow(false);
  }, [path]);

  // follow dropdown: click outside / Esc
  useEffect(() => {
    if (!follow) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !followRef.current?.contains(e.target as Node)) setFollow(false);
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", close);
    };
  }, [follow]);

  // mobile drawer: lock scroll, Esc, keep focus inside
  useEffect(() => {
    if (!menu) return;
    document.body.style.overflow = "hidden";
    const first = drawerRef.current?.querySelector<HTMLElement>("a, button");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(false);
        burgerRef.current?.focus();
      }
      if (e.key === "Tab" && drawerRef.current) {
        const f = drawerRef.current.querySelectorAll<HTMLElement>("a, button");
        const a = f[0];
        const z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          z.focus();
        } else if (!e.shiftKey && document.activeElement === z) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  const cur = (p: string) => ((p === "/" ? path === "/" : path.startsWith(p)) ? "page" : undefined);

  return (
    <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
      <div className="wrap">
        <Link href="/" className="logo" aria-label={t.nav.homeLabel}>
          <Juan pose="peek" size={42} title="" />
          <span>
            Juan Fact <span className="y">a Day</span>
          </span>
        </Link>

        <nav className="nav" aria-label={t.nav.main}>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={cur(n.href)}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="head-actions">
          <LangToggle />
          <ThemeToggle />
          <div className="follow-wrap desktop-only" ref={followRef}>
            <button className="btn btn-yellow btn-sm" aria-expanded={follow} aria-haspopup="true" onClick={() => setFollow((o) => !o)}>
              {t.nav.follow}
            </button>
            {follow && (
              <div className="follow-menu" role="menu">
                <a role="menuitem" href={FB} target="_blank" rel="noopener">
                  <b>Facebook</b>
                  <small>{t.nav.fbSub}</small>
                </a>
                <a role="menuitem" href={MSG} target="_blank" rel="noopener">
                  <b>Messenger</b>
                  <small>{t.nav.msgSub}</small>
                </a>
                <span className="soon">{t.nav.soon}</span>
              </div>
            )}
          </div>
          <button
            ref={burgerRef}
            className={`burger mobile-only ${menu ? "open" : ""}`}
            aria-label={menu ? t.nav.closeMenu : t.nav.openMenu}
            aria-expanded={menu}
            aria-controls="mobile-menu"
            onClick={() => setMenu((m) => !m)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className={`drawer-scrim ${menu ? "show" : ""}`} onClick={() => setMenu(false)} aria-hidden />
      <div id="mobile-menu" ref={drawerRef} className={`drawer ${menu ? "show" : ""}`} role="dialog" aria-modal="true" aria-label="Menu" hidden={!menu}>
        <nav aria-label="Mobile menu">
          {[...NAV, ...MORE].map((n) => (
            <Link key={n.href} href={n.href} aria-current={cur(n.href)} onClick={() => setMenu(false)}>
              {n.label}
              <span aria-hidden>→</span>
            </Link>
          ))}
        </nav>
        <div className="drawer-follow">
          <a className="btn btn-fb" href={FB} target="_blank" rel="noopener">
            {t.nav.followFb}
          </a>
          <a className="btn btn-white" href={MSG} target="_blank" rel="noopener">
            {t.nav.messageJuan}
          </a>
        </div>
        <div className="drawer-juan">
          <Juan pose="wave" size={110} title="" />
          <p>{t.nav.drawerNote}</p>
        </div>
      </div>
    </header>
  );
}
