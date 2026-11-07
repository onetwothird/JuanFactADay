/* Client-safe helpers (no Node APIs). */
export const pad = (n: number) => `#${String(n).padStart(3, "0")}`;

export function formatDate(iso: string) {
  if (!iso) return "";
  const months = ["Ene", "Peb", "Mar", "Abr", "May", "Hun", "Hul", "Ago", "Set", "Okt", "Nob", "Dis"];
  const [y, m, d] = iso.split("-").map(Number);
  return `${months[m - 1]} ${d}, ${y}`;
}

export const SITE = {
  name: "Juan Fact a Day",
  tagline: "Isang kaalaman tungkol sa Pilipinas, araw-araw.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://juanfactaday.vercel.app",
  facebook: "https://www.facebook.com/juanfactaday",
  messenger: "https://m.me/juanfactaday",
  instagram: "https://www.instagram.com/juanfactaday/",
  tiktok: "https://www.tiktok.com/@juanfactaday",
  formspree: process.env.NEXT_PUBLIC_FORMSPREE_ID ?? "",
};
