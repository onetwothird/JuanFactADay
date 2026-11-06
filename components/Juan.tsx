/* Juan — the mascot, drawn as inline SVG so every pose is crisp and tiny.
   Poses: default (bulb on), thinking (bulb off, eyes up), excited (happy eyes, big bulb),
   oops (sweat drop, wavy mouth), peek (head only). No hands, by design. */

export type JuanPose = "default" | "thinking" | "excited" | "oops" | "peek";

const NAVY = "#0A1640";

function Bulb({ on, big }: { on: boolean; big?: boolean }) {
  return (
    <g transform={`translate(522 112) scale(${big ? 0.95 : 0.78})`} className={on ? "juan-bulb on" : "juan-bulb"}>
      {on && (
        <g stroke="#FFD24A" strokeWidth={9} strokeLinecap="round">
          <path d="M0 -92 v-26" />
          <path d="M62 -66 l18 -18" />
          <path d="M-62 -66 l-18 -18" />
          <path d="M88 -10 h26" />
          <path d="M-88 -10 h-26" />
        </g>
      )}
      <path
        d="M0 -70 C-46 -70 -64 -32 -58 -4 C-52 24 -26 36 -22 62 H22 C26 36 52 24 58 -4 C64 -32 46 -70 0 -70 Z"
        fill={on ? "#FFE27A" : "#C9CFDB"}
        stroke={NAVY}
        strokeWidth={9}
        strokeLinejoin="round"
      />
      <path d="M-30 -30 C-28 -46 -14 -54 0 -54" stroke="#fff" strokeWidth={9} fill="none" strokeLinecap="round" />
      <rect x={-26} y={62} width={52} height={18} rx={6} fill="#9aa3b5" stroke={NAVY} strokeWidth={8} />
      <rect x={-20} y={80} width={40} height={16} rx={6} fill="#9aa3b5" stroke={NAVY} strokeWidth={8} />
    </g>
  );
}

export default function Juan({
  pose = "default",
  size = 240,
  title = "Si Juan, nakangiti, may ilaw na bumbilya",
  className,
}: {
  pose?: JuanPose;
  size?: number;
  title?: string;
  className?: string;
}) {
  const peek = pose === "peek";
  const viewBox = peek ? "120 40 500 440" : "0 0 600 700";
  const h = peek ? Math.round((size * 440) / 500) : Math.round((size * 700) / 600);
  const eyeDy = pose === "thinking" ? -8 : 0;
  const eyeDx = pose === "thinking" ? 4 : 7;

  return (
    <svg
      viewBox={viewBox}
      width={size}
      height={h}
      role="img"
      aria-label={title}
      className={className}
      style={{ overflow: "visible" }}
    >
      <title>{title}</title>
      <defs>
        <linearGradient id="juanShirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD24A" />
          <stop offset="1" stopColor="#F2B90F" />
        </linearGradient>
      </defs>
      {!peek && (
        <g>
          <path d="M120 700 C120 560 190 500 300 500 C410 500 480 560 480 700 Z" fill="url(#juanShirt)" stroke={NAVY} strokeWidth={10} />
          <path d="M255 505 L300 560 L345 505" fill="#0038A8" stroke={NAVY} strokeWidth={8} strokeLinejoin="round" />
          <text x="300" y="665" textAnchor="middle" fontFamily="var(--font-poppins), Poppins, sans-serif" fontWeight={800} fontSize={110} fill="#D7263D" stroke={NAVY} strokeWidth={5}>
            1
          </text>
          <path d="M150 640 C140 600 150 560 175 535" stroke={NAVY} strokeWidth={10} fill="none" strokeLinecap="round" />
          <path d="M450 640 C460 600 450 560 425 535" stroke={NAVY} strokeWidth={10} fill="none" strokeLinecap="round" />
        </g>
      )}
      <rect x={268} y={440} width={64} height={72} rx={20} fill="#B87A4F" stroke={NAVY} strokeWidth={9} />
      <ellipse cx={160} cy={320} rx={30} ry={38} fill="#C8895E" stroke={NAVY} strokeWidth={9} />
      <ellipse cx={440} cy={320} rx={30} ry={38} fill="#C8895E" stroke={NAVY} strokeWidth={9} />
      <path d="M165 300 C165 180 225 135 300 135 C375 135 435 180 435 300 C435 405 380 465 300 465 C220 465 165 405 165 300 Z" fill="#C8895E" stroke={NAVY} strokeWidth={10} />
      <path
        d="M160 300 C150 230 165 170 205 140 L200 105 L245 125 L255 85 L295 115 L320 78 L345 118 L385 95 L392 135 L432 128 C452 175 450 240 440 292 C428 248 405 222 372 210 C330 240 270 238 228 222 C205 245 182 268 160 300 Z"
        fill="#1d1d24"
        stroke={NAVY}
        strokeWidth={10}
        strokeLinejoin="round"
      />
      <path d="M228 222 C262 200 300 196 330 214" fill="none" stroke="#3a3a48" strokeWidth={9} strokeLinecap="round" />

      {/* eyebrows */}
      {pose === "thinking" ? (
        <>
          <path d="M215 258 q32 -6 64 2" stroke="#1d1d24" strokeWidth={13} fill="none" strokeLinecap="round" />
          <path d="M322 246 q32 -26 64 0" stroke="#1d1d24" strokeWidth={13} fill="none" strokeLinecap="round" />
        </>
      ) : pose === "oops" ? (
        <>
          <path d="M215 250 q32 10 64 18" stroke="#1d1d24" strokeWidth={13} fill="none" strokeLinecap="round" />
          <path d="M322 268 q32 -8 64 -18" stroke="#1d1d24" strokeWidth={13} fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M215 262 q32 -26 64 -6" stroke="#1d1d24" strokeWidth={13} fill="none" strokeLinecap="round" />
          <path d="M322 256 q32 -20 64 6" stroke="#1d1d24" strokeWidth={13} fill="none" strokeLinecap="round" />
        </>
      )}

      {/* eyes */}
      {pose === "excited" ? (
        <>
          <path d="M224 318 q24 -30 48 0" stroke="#1d1d24" strokeWidth={12} fill="none" strokeLinecap="round" />
          <path d="M328 318 q24 -30 48 0" stroke="#1d1d24" strokeWidth={12} fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx={248} cy={310} rx={26} ry={30} fill="#fff" stroke={NAVY} strokeWidth={7} />
          <ellipse cx={352} cy={310} rx={26} ry={30} fill="#fff" stroke={NAVY} strokeWidth={7} />
          <circle cx={248 + eyeDx} cy={316 + eyeDy} r={13} fill="#1d1d24" />
          <circle cx={352 + eyeDx} cy={316 + eyeDy} r={13} fill="#1d1d24" />
          <circle cx={253 + eyeDx} cy={310 + eyeDy} r={5} fill="#fff" />
          <circle cx={357 + eyeDx} cy={310 + eyeDy} r={5} fill="#fff" />
        </>
      )}

      <path d="M300 335 q-14 30 4 38" stroke="#8a5534" strokeWidth={7} fill="none" strokeLinecap="round" />
      <ellipse cx={215} cy={375} rx={22} ry={12} fill="#e2735f" opacity={0.45} />
      <ellipse cx={385} cy={375} rx={22} ry={12} fill="#e2735f" opacity={0.45} />

      {/* mouth */}
      {pose === "thinking" ? (
        <path d="M275 410 q25 -8 50 2" stroke="#7a1e24" strokeWidth={10} fill="none" strokeLinecap="round" />
      ) : pose === "oops" ? (
        <path d="M258 412 q14 -14 28 0 t28 0 t28 0" stroke="#7a1e24" strokeWidth={9} fill="none" strokeLinecap="round" />
      ) : (
        <>
          <path
            d={pose === "excited" ? "M232 384 C255 452 345 452 368 384 Z" : "M240 388 C260 440 340 440 360 388 Z"}
            fill="#7a1e24"
            stroke={NAVY}
            strokeWidth={8}
            strokeLinejoin="round"
          />
          <path d="M252 392 C275 402 325 402 348 392 L345 404 C320 412 280 412 255 404 Z" fill="#fff" />
        </>
      )}

      {pose === "oops" && (
        <path d="M418 220 C418 220 398 250 398 264 a20 20 0 0 0 40 0 C438 250 418 220 418 220 Z" fill="#8FD3FF" stroke={NAVY} strokeWidth={6} />
      )}

      <Bulb on={pose !== "thinking" && pose !== "oops"} big={pose === "excited"} />
    </svg>
  );
}
