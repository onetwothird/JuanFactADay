"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const SEL = [
  "main .wrap > *",
  "main .prose > *",
  "main .komiks > *",
  "main .reel-shelf > *",
  "main .fcard",
  ".site-footer .foot-cta",
  ".site-footer .foot-grid > *",
].join(",");

const NOT_PAGES = /^\/(random|rss\.xml|sitemap\.xml|robots\.txt)(\/|$)|\.\w+$/;

const EASE_OUT = "cubic-bezier(.16, .84, .3, 1)";
const EASE_IN = "cubic-bezier(.5, 0, .75, 0)";
const RISE = 28; 

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const preloading = () => {
  const p = document.documentElement.dataset.preload;
  return p !== "skip" && p !== "done";
};

type State = "hidden" | "in" | "out" | "static";
type Track = { state: State; seen: boolean; anim?: Animation };

export default function Motion() {
  const router = useRouter();
  const pathname = usePathname();
  const finishNav = useRef<(() => void) | null>(null);
  const firstPath = useRef(true);

  useEffect(() => {
    if (reduced() || !("IntersectionObserver" in window) || !("animate" in Element.prototype)) return;

    const tracked = new WeakMap<Element, Track>();
    let queued: HTMLElement[] = [];
    const TOP = 0.08,
      BOTTOM = 0.06; 

    const isTarget = (el: HTMLElement) => {
      if (tracked.has(el) || el.querySelector(SEL)) return false;
      if (el.tagName === "HR") return false; 
      if (el.closest("dialog, [role='dialog'], [data-no-reveal]")) return false;
      if (!el.getClientRects().length) return false; 
      const pos = getComputedStyle(el).position;
      return pos !== "fixed" && pos !== "sticky";
    };

    const play = (el: Element, t: Track, next: State, delay = 0) => {
      t.anim?.cancel();
      t.state = next;
      if (next === "hidden") {
        t.anim = el.animate([{ opacity: 0 }], { fill: "forwards" });
      } else if (next === "in") {
        t.anim = el.animate(
          [
            { opacity: 0, translate: `0 ${RISE}px`, scale: "0.98" },
            { opacity: 1, translate: "0 0", scale: "1" },
          ],
          { duration: 650, delay, easing: EASE_OUT, fill: "backwards" },
        );
      } else if (next === "out") {
        const below = el.getBoundingClientRect().top > window.innerHeight / 2;
        t.anim = el.animate(
          [
            { opacity: 1, translate: "0 0", scale: "1" },
            { opacity: 0, translate: `0 ${below ? 26 : -26}px`, scale: "0.98" },
          ],
          { duration: 380, easing: EASE_IN, fill: "forwards" },
        );
      } else {
        t.anim = undefined;
      }
    };

    const reveal = (els: HTMLElement[]) => {
      els
        .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
        .forEach((el, k) => {
          const t = tracked.get(el);
          if (t) play(el, t, "in", Math.min(k, 4) * 60);
        });
    };

    // Where the element really sits, undoing the animation's own translate/scale
    // (IntersectionObserver and getBoundingClientRect measure the *moved* box).
    const layout = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const ty = parseFloat(cs.translate.split(" ")[1] ?? "0") || 0;
      const sc = parseFloat(cs.scale) || 1;
      const h = r.height / sc;
      const top = r.top - ty - (h - r.height) / 2;
      return { top, bottom: top + h };
    };

    // Hysteresis: content enters once it is 6% up from the bottom edge, but only resets once it has
    // fully left the screen. The gap is wider than the animation's own movement, so the animation can
    // never push an element back across the line it just crossed (that loop caused flicker).
    const onEnter = new IntersectionObserver(
      (entries) => {
        const entering: HTMLElement[] = [];
        const vh = window.innerHeight;
        for (const e of entries) {
          const el = e.target as HTMLElement;
          const t = tracked.get(el);
          if (!t) continue;
          const { top, bottom } = layout(el);
          if (top >= vh * (1 - BOTTOM) || bottom <= vh * TOP) continue;
          t.seen = true;
          if (t.state === "hidden" || t.state === "out") entering.push(el);
        }
        if (!entering.length) return;
        if (preloading()) queued.push(...entering);
        else reveal(entering);
      },
      { rootMargin: `-${TOP * 100}% 0px -${BOTTOM * 100}% 0px`, threshold: 0 },
    );
    const onExit = new IntersectionObserver(
      (entries) => {
        const vh = window.innerHeight;
        for (const e of entries) {
          const el = e.target as HTMLElement;
          const t = tracked.get(el);
          if (!t || e.isIntersecting || !t.seen || (t.state !== "in" && t.state !== "static")) continue;
          const { top, bottom } = layout(el);
          if (top < vh && bottom > 0) continue; // still (partly) on screen by its real position
          play(el, t, "out"); // re-arms the entrance for the next time it scrolls into view
        }
      },
      { threshold: 0 },
    );

    const track = (initial: boolean) => {
      const vh = window.innerHeight;
      for (const el of Array.from(document.querySelectorAll<HTMLElement>(SEL))) {
        if (!isTarget(el)) continue;
        const r = el.getBoundingClientRect();
        const inView = r.top < vh * (1 - BOTTOM) && r.bottom > vh * TOP;
        const t: Track = { state: "static", seen: false };
        tracked.set(el, t);
        // On first paint, content already on screen stays put (no flash) unless the
        // preloader is covering it, in which case it cascades in as the splash lifts.
        play(el, t, initial && inView && !preloading() ? "static" : "hidden");
        onEnter.observe(el);
        onExit.observe(el);
      }
    };
    track(true);

    // splash lifted → play whatever was waiting behind it
    const htmlObs = new MutationObserver(() => {
      if (!preloading() && queued.length) {
        reveal(queued);
        queued = [];
      }
    });
    htmlObs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-preload"] });

    // new content (route changes, filters, quiz results…) → track it too
    let raf = 0;
    const domObs = new MutationObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => track(false));
    });
    domObs.observe(document.body, { childList: true, subtree: true });

    return () => {
      onEnter.disconnect();
      onExit.disconnect();
      htmlObs.disconnect();
      domObs.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  // ---- page transitions ----
  useEffect(() => {
    if (reduced() || !("startViewTransition" in document)) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || !a.href || a.hasAttribute("download") || (a.target && a.target !== "_self")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname || NOT_PAGES.test(url.pathname)) return;

      e.preventDefault();
      document.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            const t = window.setTimeout(resolve, 1500); // never hang the transition
            finishNav.current = () => {
              window.clearTimeout(t);
              resolve();
            };
            router.push(url.pathname + url.search + url.hash);
          }),
      );
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  // new route committed → let the view transition capture the new page
  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    finishNav.current?.();
    finishNav.current = null;
  }, [pathname]);

  return null;
}
