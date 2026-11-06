/* Tiny dependency-free confetti burst in the flag's colors, with little 8-ray suns mixed in.
   Draws on a temporary full-screen canvas that removes itself when the last piece falls away.
   No-op under prefers-reduced-motion. */

const COLORS = ["#0038A8", "#D7263D", "#FFC72C", "#FFFFFF", "#2B4DB8"];

type Piece = {
  x: number; y: number; vx: number; vy: number;
  r: number; vr: number; size: number; color: string;
  shape: "rect" | "dot" | "sun"; life: number; wobble: number;
};

function drawSun(g: CanvasRenderingContext2D, s: number) {
  g.beginPath();
  g.arc(0, 0, s * 0.42, 0, Math.PI * 2);
  g.fill();
  for (let k = 0; k < 8; k++) {
    g.rotate(Math.PI / 4);
    g.beginPath();
    g.moveTo(-s * 0.12, -s * 0.5);
    g.lineTo(0, -s * 0.95);
    g.lineTo(s * 0.12, -s * 0.5);
    g.fill();
  }
}

export function confetti({ count = 140, origin = { x: 0.5, y: 0.45 }, spread = 1, waves = 1 } = {}) {
  if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const c = document.createElement("canvas");
  c.setAttribute("aria-hidden", "true");
  c.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:900";
  document.body.appendChild(c);
  const g = c.getContext("2d")!;
  const W = window.innerWidth;
  const H = window.innerHeight;
  c.width = W * dpr;
  c.height = H * dpr;
  g.scale(dpr, dpr);

  const pieces: Piece[] = [];
  const burst = () => {
    const ox = origin.x * W;
    const oy = origin.y * H;
    for (let k = 0; k < count; k++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1 * spread;
      const v = 7 + Math.random() * 9;
      const roll = Math.random();
      pieces.push({
        x: ox + (Math.random() - 0.5) * 40,
        y: oy,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - 3,
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        size: 7 + Math.random() * 7,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        shape: roll < 0.12 ? "sun" : roll < 0.35 ? "dot" : "rect",
        life: 0,
        wobble: Math.random() * 10,
      });
    }
  };
  burst();
  for (let w = 1; w < waves; w++) setTimeout(burst, w * 380);

  let raf = 0;
  const started = performance.now();
  const tick = () => {
    g.clearRect(0, 0, W, H);
    let alive = 0;
    for (const p of pieces) {
      p.life++;
      p.vy += 0.28; // gravity
      p.vx *= 0.985; // air drag
      p.vy *= 0.985;
      p.x += p.vx + Math.sin((p.life + p.wobble) / 9) * 0.6;
      p.y += p.vy;
      p.r += p.vr;
      if (p.y > H + 40) continue;
      alive++;
      g.save();
      g.translate(p.x, p.y);
      g.rotate(p.r);
      g.globalAlpha = Math.max(0, Math.min(1, 1.6 - p.life / 140));
      g.fillStyle = p.shape === "sun" ? "#FFC72C" : p.color;
      if (p.shape === "rect") g.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2.2);
      else if (p.shape === "dot") {
        g.beginPath();
        g.arc(0, 0, p.size / 3, 0, Math.PI * 2);
        g.fill();
      } else drawSun(g, p.size * 1.2);
      g.restore();
    }
    const waiting = performance.now() - started < (waves - 1) * 380 + 50;
    if (alive || waiting) raf = requestAnimationFrame(tick);
    else c.remove();
  };
  raf = requestAnimationFrame(tick);
  setTimeout(() => {
    cancelAnimationFrame(raf);
    c.remove();
  }, 6000);
}
