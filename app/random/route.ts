import { NextResponse } from "next/server";
import { getAllFacts } from "@/lib/facts";

export const dynamic = "force-dynamic";

export function GET(req: Request) {
  const facts = getAllFacts();
  const f = facts[Math.floor(Math.random() * facts.length)];
  return NextResponse.redirect(new URL(`/facts/${f.slug}`, req.url), 307);
}
