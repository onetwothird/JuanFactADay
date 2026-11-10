import type * as React from "react";

export type JuanPose = "wave" | "stand" | "thinking" | "excited" | "oops" | "read" | "magnify" | "sign" | "peek";

const NAVY = "#0A1640";
const SKIN = "#C8895E";
const SKIN_D = "#B87A4F";
const HAIR = "#1d1d24";
const PANTS = "#1E3A8A";

type Pt = [number, number];

function Arm({ from, mid, to, hand = 0, sleeve = true, open = false }: { from: Pt; mid: Pt; to: Pt; hand?: number; sleeve?: boolean; open?: boolean }) {
  const d = `M${from[0]} ${from[1]} Q${mid[0]} ${mid[1]} ${to[0]} ${to[1]}`;
  return (
    <g>
      <path d={d} stroke={NAVY} strokeWidth={58} fill="none" strokeLinecap="round" />
      <path d={d} stroke={SKIN} strokeWidth={42} fill="none" strokeLinecap="round" />
      {sleeve && <circle cx={from[0]} cy={from[1] + 6} r={36} fill="#FFD24A" stroke={NAVY} strokeWidth={9} />}
      <Hand at={to} rot={hand} open={open} />
    </g>
  );
}

function Hand({ at, rot, open = false }: { at: Pt; rot: number; open?: boolean }) {
  if (open) {
    const parts = (
      <>
        <path d="M-30 -14 C-32 -40 -28 -62 -2 -64 C26 -66 34 -46 32 -20 C30 0 18 6 0 6 C-18 6 -28 2 -30 -14 Z" />
        <rect x={-30} y={-112} width={17} height={62} rx={8.5} transform="rotate(-8 -21.5 -60)" />
        <rect x={-12} y={-122} width={17} height={70} rx={8.5} transform="rotate(-2 -3.5 -60)" />
        <rect x={6} y={-118} width={17} height={66} rx={8.5} transform="rotate(5 14.5 -60)" />
        <rect x={22} y={-102} width={15} height={52} rx={7.5} transform="rotate(12 29.5 -60)" />
        <rect x={-62} y={-40} width={44} height={17} rx={8.5} transform="rotate(-38 -24 -31)" />
      </>
    );
    return (
      <g transform={`translate(${at[0]} ${at[1]}) rotate(${rot})`}>
        <g fill={NAVY} stroke={NAVY} strokeWidth={16} strokeLinejoin="round">{parts}</g>
        <g fill={SKIN}>{parts}</g>
        <path d="M-12 -56 v-8 M6 -56 v-10 M22 -54 v-6" stroke={NAVY} strokeWidth={4} strokeLinecap="round" opacity={0.5} />
        <path d="M-14 -22 q12 10 30 2" stroke={SKIN_D} strokeWidth={5} fill="none" strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g transform={`translate(${at[0]} ${at[1]}) rotate(${rot})`}>
      <ellipse cx={0} cy={0} rx={32} ry={29} fill={SKIN} stroke={NAVY} strokeWidth={9} />
      <path d="M-14 -10 q10 -8 22 -2" stroke={NAVY} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.45} />
    </g>
  );
}

function Bulb({ on, big, x = 470, y = 70 }: { on: boolean; big?: boolean; x?: number; y?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${big ? 0.95 : 0.78})`} className={on ? "juan-bulb on" : "juan-bulb"}>
      {on && (
        <g stroke="#FFD24A" strokeWidth={9} strokeLinecap="round">
          <path d="M0 -92 v-26" />
          <path d="M62 -66 l18 -18" />
          <path d="M-62 -66 l-18 -18" />
          <path d="M88 -10 h26" />
          <path d="M-88 -10 h-26" />
        </g>
      )}
      <path d="M0 -70 C-46 -70 -64 -32 -58 -4 C-52 24 -26 36 -22 62 H22 C26 36 52 24 58 -4 C64 -32 46 -70 0 -70 Z" fill={on ? "#FFE27A" : "#C9CFDB"} stroke={NAVY} strokeWidth={9} strokeLinejoin="round" />
      <path d="M-30 -30 C-28 -46 -14 -54 0 -54" stroke="#fff" strokeWidth={9} fill="none" strokeLinecap="round" />
      <rect x={-26} y={62} width={52} height={18} rx={6} fill="#9aa3b5" stroke={NAVY} strokeWidth={8} />
      <rect x={-20} y={80} width={40} height={16} rx={6} fill="#9aa3b5" stroke={NAVY} strokeWidth={8} />
    </g>
  );
}

type Face = "smile" | "think" | "joy" | "oops" | "focus";

function Head({ face }: { face: Face }) {
  const look: Pt = face === "think" ? [5, -9] : face === "focus" ? [3, 8] : [7, 0];
  return (
    <g>
      <ellipse cx={160} cy={320} rx={30} ry={38} fill={SKIN} stroke={NAVY} strokeWidth={9} />
      <ellipse cx={440} cy={320} rx={30} ry={38} fill={SKIN} stroke={NAVY} strokeWidth={9} />
      <path d="M165 300 C165 180 225 135 300 135 C375 135 435 180 435 300 C435 405 380 465 300 465 C220 465 165 405 165 300 Z" fill={SKIN} stroke={NAVY} strokeWidth={10} />
      <path
        d="M160 300 C150 230 165 170 205 140 L200 105 L245 125 L255 85 L295 115 L320 78 L345 118 L385 95 L392 135 L432 128 C452 175 450 240 440 292 C428 248 405 222 372 210 C330 240 270 238 228 222 C205 245 182 268 160 300 Z"
        fill={HAIR}
        stroke={NAVY}
        strokeWidth={10}
        strokeLinejoin="round"
      />
      <path d="M228 222 C262 200 300 196 330 214" fill="none" stroke="#3a3a48" strokeWidth={9} strokeLinecap="round" />

      {face === "think" ? (
        <>
          <path d="M215 258 q32 -6 64 2" stroke={HAIR} strokeWidth={13} fill="none" strokeLinecap="round" />
          <path d="M322 246 q32 -26 64 0" stroke={HAIR} strokeWidth={13} fill="none" strokeLinecap="round" />
        </>
      ) : face === "oops" ? (
        <>
          <path d="M215 250 q32 10 64 18" stroke={HAIR} strokeWidth={13} fill="none" strokeLinecap="round" />
          <path d="M322 268 q32 -8 64 -18" stroke={HAIR} strokeWidth={13} fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M215 262 q32 -26 64 -6" stroke={HAIR} strokeWidth={13} fill="none" strokeLinecap="round" />
          <path d="M322 256 q32 -20 64 6" stroke={HAIR} strokeWidth={13} fill="none" strokeLinecap="round" />
        </>
      )}

      {face === "joy" ? (
        <>
          <path d="M224 318 q24 -30 48 0" stroke={HAIR} strokeWidth={12} fill="none" strokeLinecap="round" />
          <path d="M328 318 q24 -30 48 0" stroke={HAIR} strokeWidth={12} fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx={248} cy={310} rx={26} ry={30} fill="#fff" stroke={NAVY} strokeWidth={7} />
          <ellipse cx={352} cy={310} rx={26} ry={30} fill="#fff" stroke={NAVY} strokeWidth={7} />
          <circle cx={248 + look[0]} cy={316 + look[1]} r={13} fill={HAIR} />
          <circle cx={352 + look[0]} cy={316 + look[1]} r={13} fill={HAIR} />
          <circle cx={253 + look[0]} cy={310 + look[1]} r={5} fill="#fff" />
          <circle cx={357 + look[0]} cy={310 + look[1]} r={5} fill="#fff" />
        </>
      )}

      <path d="M300 335 q-14 30 4 38" stroke="#8a5534" strokeWidth={7} fill="none" strokeLinecap="round" />
      <ellipse cx={215} cy={375} rx={22} ry={12} fill="#e2735f" opacity={0.45} />
      <ellipse cx={385} cy={375} rx={22} ry={12} fill="#e2735f" opacity={0.45} />

      {face === "think" || face === "focus" ? (
        <path d={face === "think" ? "M275 410 q25 -8 50 2" : "M270 404 q30 18 60 0"} stroke="#7a1e24" strokeWidth={10} fill="none" strokeLinecap="round" />
      ) : face === "oops" ? (
        <ellipse cx={300} cy={412} rx={22} ry={18} fill="#7a1e24" stroke={NAVY} strokeWidth={7} />
      ) : (
        <>
          <path d={face === "joy" ? "M232 384 C255 452 345 452 368 384 Z" : "M240 388 C260 440 340 440 360 388 Z"} fill="#7a1e24" stroke={NAVY} strokeWidth={8} strokeLinejoin="round" />
          <path d="M252 392 C275 402 325 402 348 392 L345 404 C320 412 280 412 255 404 Z" fill="#fff" />
        </>
      )}
      {face === "oops" && <path d="M440 210 C440 210 420 240 420 254 a20 20 0 0 0 40 0 C460 240 440 210 440 210 Z" fill="#8FD3FF" stroke={NAVY} strokeWidth={6} />}
    </g>
  );
}

function Body({ jump }: { jump?: boolean }) {
  const lx = jump ? 228 : 238;
  const rx = jump ? 312 : 302;
  return (
    <g>
      {/* legs */}
      <path d={`M${lx} 760 L${lx - (jump ? 18 : 0)} 920`} stroke={NAVY} strokeWidth={70} strokeLinecap="round" />
      <path d={`M${rx + 60} 760 L${rx + 60 + (jump ? 18 : 0)} 920`} stroke={NAVY} strokeWidth={70} strokeLinecap="round" />
      <path d={`M${lx} 760 L${lx - (jump ? 18 : 0)} 920`} stroke={PANTS} strokeWidth={54} strokeLinecap="round" />
      <path d={`M${rx + 60} 760 L${rx + 60 + (jump ? 18 : 0)} 920`} stroke={PANTS} strokeWidth={54} strokeLinecap="round" />
      {/* sneakers */}
      <g>
        <path d={`M${lx - 52 - (jump ? 18 : 0)} 962 q0 -44 46 -44 h22 q22 0 22 28 v16 z`} fill="#fff" stroke={NAVY} strokeWidth={9} strokeLinejoin="round" />
        <path d={`M${lx - 52 - (jump ? 18 : 0)} 962 h90`} stroke="#D7263D" strokeWidth={12} strokeLinecap="round" />
        <path d={`M${rx + 112 + (jump ? 18 : 0)} 962 q0 -44 -46 -44 h-22 q-22 0 -22 28 v16 z`} fill="#fff" stroke={NAVY} strokeWidth={9} strokeLinejoin="round" />
        <path d={`M${rx + 112 + (jump ? 18 : 0)} 962 h-90`} stroke="#D7263D" strokeWidth={12} strokeLinecap="round" />
      </g>
      {/* neck + shirt */}
      <rect x={268} y={440} width={64} height={80} rx={20} fill={SKIN_D} stroke={NAVY} strokeWidth={9} />
      <path d="M190 560 C190 520 230 500 300 500 C370 500 410 520 410 560 L420 770 C380 785 220 785 180 770 Z" fill="url(#juanShirt)" stroke={NAVY} strokeWidth={10} strokeLinejoin="round" />
      <path d="M255 503 L300 556 L345 503" fill="#0038A8" stroke={NAVY} strokeWidth={8} strokeLinejoin="round" />
      {/* the "1" on the shirt, drawn as a shape so it never shows up in copied text */}
      <path d="M272 616 L314 594 L328 594 L328 690 L348 690 L348 712 L262 712 L262 690 L290 690 L290 628 L276 636 Z" fill="#D7263D" stroke={NAVY} strokeWidth={6} strokeLinejoin="round" />
    </g>
  );
}

export default function Juan({
  pose = "wave",
  size = 240,
  sign = "Alam mo ba?",
  title = "Si Juan, ang mascot ng Juan Fact a Day",
  className,
}: {
  pose?: JuanPose;
  size?: number;
  sign?: string;
  title?: string;
  className?: string;
}) {
  if (pose === "peek") {
    return (
      <svg viewBox="120 0 500 480" width={size} height={Math.round((size * 480) / 500)} role={title ? "img" : undefined} aria-label={title || undefined} aria-hidden={title ? undefined : true} className={className} style={{ overflow: "visible" }}>
        {title && <title>{title}</title>}
        <rect x={268} y={440} width={64} height={40} fill={SKIN_D} stroke={NAVY} strokeWidth={9} />
        <Head face="smile" />
        <Bulb on x={522} y={112} />
      </svg>
    );
  }

  const face: Face =
    pose === "thinking" ? "think" : pose === "excited" ? "joy" : pose === "oops" ? "oops" : pose === "read" ? "focus" : "smile";
  const bulbOn = pose !== "thinking" && pose !== "oops";

  // arms: [left, right] from shoulder → elbow control → hand
  const L: Pt = [205, 545];
  const R: Pt = [395, 545];
  let arms: React.ReactNode = null;
  let front: React.ReactNode = null; // props drawn over the body
  let extra: React.ReactNode = null;

  switch (pose) {
    case "wave":
      arms = (
        <>
          <Arm from={L} mid={[160, 650]} to={[185, 745]} hand={10} />
          <Arm from={R} mid={[508, 525]} to={[512, 422]} hand={10} open />
        </>
      );
      extra = (
        <g stroke={NAVY} strokeWidth={8} strokeLinecap="round" fill="none" className="juan-wave">
          <path d="M560 302 q14 20 0 42" />
          <path d="M582 286 q24 34 0 74" />
        </g>
      );
      break;
    case "stand":
      arms = (
        <>
          <Arm from={L} mid={[120, 640]} to={[200, 720]} hand={-30} />
          <Arm from={R} mid={[480, 640]} to={[400, 720]} hand={210} />
        </>
      );
      break;
    case "thinking":
      arms = (
        <>
          <Arm from={L} mid={[215, 660]} to={[350, 640]} hand={-10} />
          <Arm from={R} mid={[420, 640]} to={[335, 468]} hand={200} />
        </>
      );
      extra = (
        <g fill="#fff" stroke={NAVY} strokeWidth={6}>
          <circle cx={505} cy={235} r={10} />
          <circle cx={535} cy={190} r={15} />
        </g>
      );
      break;
    case "excited":
      arms = (
        <>
          <Arm from={L} mid={[120, 470]} to={[110, 360]} hand={-150} />
          <Arm from={R} mid={[480, 470]} to={[490, 360]} hand={150} />
        </>
      );
      extra = (
        <g stroke="#FFC72C" strokeWidth={10} strokeLinecap="round">
          <path d="M60 300 l-30 -20" />
          <path d="M70 250 l-24 -36" />
          <path d="M540 300 l30 -20" />
          <path d="M530 250 l24 -36" />
          <path d="M200 990 h-50 M420 990 h50" stroke={NAVY} strokeWidth={8} />
        </g>
      );
      break;
    case "oops":
      arms = (
        <>
          <Arm from={L} mid={[120, 520]} to={[185, 395]} hand={-120} />
          <Arm from={R} mid={[480, 520]} to={[415, 395]} hand={120} />
        </>
      );
      break;
    case "read":
      arms = (
        <>
          <Arm from={L} mid={[170, 660]} to={[205, 640]} hand={-20} />
          <Arm from={R} mid={[430, 660]} to={[395, 640]} hand={200} />
        </>
      );
      front = (
        <g>
          <path d="M300 590 C250 560 190 562 160 575 V700 C190 688 250 688 300 712 Z" fill="#fff" stroke={NAVY} strokeWidth={9} strokeLinejoin="round" />
          <path d="M300 590 C350 560 410 562 440 575 V700 C410 688 350 688 300 712 Z" fill="#FFF8E7" stroke={NAVY} strokeWidth={9} strokeLinejoin="round" />
          <path d="M190 605 q40 -10 85 6 M190 630 q40 -10 85 6 M190 655 q40 -10 85 6 M325 611 q40 -16 85 -6 M325 636 q40 -16 85 -6" stroke="#9aa3b5" strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="M160 700 V712 C190 700 250 700 300 724 C350 700 410 700 440 712 V700" fill="#D7263D" stroke={NAVY} strokeWidth={7} />
          <Hand at={[172, 650]} rot={-20} />
          <Hand at={[428, 650]} rot={200} />
        </g>
      );
      arms = (
        <>
          <Arm from={L} mid={[150, 630]} to={[172, 650]} hand={-20} />
          <Arm from={R} mid={[450, 630]} to={[428, 650]} hand={200} />
        </>
      );
      break;
    case "magnify":
      arms = (
        <>
          <Arm from={L} mid={[160, 650]} to={[190, 745]} hand={10} />
          <Arm from={R} mid={[500, 600]} to={[470, 470]} hand={160} />
        </>
      );
      front = (
        <g>
          <path d="M470 470 L492 420" stroke={NAVY} strokeWidth={30} strokeLinecap="round" />
          <path d="M470 470 L492 420" stroke="#8a5534" strokeWidth={18} strokeLinecap="round" />
          <circle cx={520} cy={340} r={84} fill="#dff1ff" fillOpacity={0.55} stroke={NAVY} strokeWidth={14} />
          <circle cx={520} cy={340} r={70} fill="none" stroke="#FFC72C" strokeWidth={8} />
          <path d="M488 320 q16 -18 38 -14" stroke="#fff" strokeWidth={9} fill="none" strokeLinecap="round" />
          <Hand at={[470, 470]} rot={160} />
        </g>
      );
      break;
    case "sign":
      arms = (
        <>
          <Arm from={L} mid={[130, 660]} to={[100, 660]} hand={-60} />
          <Arm from={R} mid={[470, 660]} to={[500, 660]} hand={240} />
        </>
      );
      front = (
        <g>
          <rect x={95} y={545} width={410} height={150} rx={18} fill="#fff" stroke={NAVY} strokeWidth={10} />
          <rect x={95} y={545} width={410} height={22} rx={10} fill="#D7263D" stroke={NAVY} strokeWidth={6} />
          <text x={300} y={648} textAnchor="middle" fontFamily="var(--font-poppins), Poppins, sans-serif" fontWeight={800} fontSize={52} fill={NAVY} {...(sign.length > 9 ? { textLength: 285, lengthAdjust: "spacingAndGlyphs" } : {})}>
            {sign}
          </text>
          <Hand at={[100, 660]} rot={-60} />
          <Hand at={[500, 660]} rot={240} />
        </g>
      );
      break;
  }

  return (
    <svg
      viewBox="0 0 600 1000"
      width={size}
      height={Math.round((size * 1000) / 600)}
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      className={className}
      style={{ overflow: "visible", userSelect: "none" }}
    >
      {title && <title>{title}</title>}
      <defs>
        <linearGradient id="juanShirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD24A" />
          <stop offset="1" stopColor="#F2B90F" />
        </linearGradient>
      </defs>
      <ellipse cx={300} cy={975} rx={180} ry={16} fill="#0A164055" />
      <g transform={pose === "excited" ? "translate(0 -30)" : undefined}>
        <Body jump={pose === "excited"} />
        {arms}
        <Head face={face} />
        {front}
        {extra}
        <Bulb on={bulbOn} big={pose === "excited"} x={pose === "magnify" ? 120 : 480} y={70} />
      </g>
    </svg>
  );
}
