/* Small hand-drawn style icons (flat, thick navy outline) instead of emoji. */
const N = "#0A1640";
const sw = 5;

export default function CategoryIcon({ slug, size = 28 }: { slug: string; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 64 64", "aria-hidden": true } as const;
  switch (slug) {
    case "kasaysayan": // salakot
      return (
        <svg {...common}>
          <path d="M6 40 L32 12 L58 40 Z" fill="#E9B65C" stroke={N} strokeWidth={sw} strokeLinejoin="round" />
          <path d="M18 40 h28" stroke={N} strokeWidth={sw} strokeLinecap="round" />
          <path d="M24 40 q8 14 16 0" fill="none" stroke={N} strokeWidth={4} />
          <circle cx="32" cy="12" r="4" fill="#D7263D" stroke={N} strokeWidth={3} />
        </svg>
      );
    case "kultura": // jeepney front
      return (
        <svg {...common}>
          <rect x="8" y="18" width="48" height="30" rx="6" fill="#D7263D" stroke={N} strokeWidth={sw} />
          <rect x="14" y="22" width="36" height="12" rx="3" fill="#DCE6FF" stroke={N} strokeWidth={4} />
          <path d="M8 40 h48" stroke="#FFC72C" strokeWidth={5} />
          <circle cx="18" cy="52" r="5" fill={N} />
          <circle cx="46" cy="52" r="5" fill={N} />
          <path d="M32 8 l4 10 h-8 z" fill="#FFC72C" stroke={N} strokeWidth={3} strokeLinejoin="round" />
        </svg>
      );
    case "lugar": // island with palm
      return (
        <svg {...common}>
          <path d="M6 50 q26 -14 52 0" fill="#F4D58D" stroke={N} strokeWidth={sw} strokeLinecap="round" />
          <path d="M32 44 q-2 -16 4 -28" fill="none" stroke={N} strokeWidth={sw} strokeLinecap="round" />
          <path d="M36 16 q-14 -6 -22 4 M36 16 q14 -8 22 2 M36 16 q-4 -10 -14 -12 M36 16 q6 -10 16 -10" fill="none" stroke="#2F9E5B" strokeWidth={5} strokeLinecap="round" />
          <path d="M4 58 h56" stroke="#4F8BF0" strokeWidth={4} strokeLinecap="round" />
        </svg>
      );
    case "pagkain": // palayok / banga
      return (
        <svg {...common}>
          <path d="M14 26 h36 c4 18 -4 30 -18 30 s-22 -12 -18 -30 z" fill="#B8613A" stroke={N} strokeWidth={sw} strokeLinejoin="round" />
          <rect x="12" y="20" width="40" height="8" rx="4" fill="#C9763F" stroke={N} strokeWidth={4} />
          <path d="M24 14 q2 -6 0 -10 M32 14 q2 -6 0 -10 M40 14 q2 -6 0 -10" stroke="#DCE6FF" strokeWidth={3} fill="none" strokeLinecap="round" />
        </svg>
      );
    case "hayop": // tarsier
      return (
        <svg {...common}>
          <circle cx="32" cy="36" r="20" fill="#A87B55" stroke={N} strokeWidth={sw} />
          <circle cx="23" cy="34" r="8" fill="#FFF3C4" stroke={N} strokeWidth={3} />
          <circle cx="41" cy="34" r="8" fill="#FFF3C4" stroke={N} strokeWidth={3} />
          <circle cx="23" cy="34" r="4" fill={N} />
          <circle cx="41" cy="34" r="4" fill={N} />
          <ellipse cx="12" cy="18" rx="7" ry="9" fill="#A87B55" stroke={N} strokeWidth={4} />
          <ellipse cx="52" cy="18" rx="7" ry="9" fill="#A87B55" stroke={N} strokeWidth={4} />
        </svg>
      );
    case "wika": // baybayin-style stroke
      return (
        <svg {...common}>
          <rect x="6" y="8" width="52" height="48" rx="8" fill="#FFF8E7" stroke={N} strokeWidth={sw} />
          <path d="M18 40 q6 -18 14 -6 q8 12 14 -10" fill="none" stroke={N} strokeWidth={5} strokeLinecap="round" />
          <circle cx="32" cy="20" r="3.5" fill={N} />
        </svg>
      );
    default: // tao — kalasag (shield)
      return (
        <svg {...common}>
          <path d="M32 6 L54 14 V30 C54 44 44 54 32 58 C20 54 10 44 10 30 V14 Z" fill="#0038A8" stroke={N} strokeWidth={sw} strokeLinejoin="round" />
          <path d="M32 18 l4 9 10 1 -8 6 3 10 -9 -6 -9 6 3 -10 -8 -6 10 -1 z" fill="#FFC72C" stroke={N} strokeWidth={2.5} strokeLinejoin="round" />
        </svg>
      );
  }
}
