import { devOnly } from "@/lib/admin/guard";
import { listStories, runSync } from "@/lib/admin/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const blocked = devOnly(req);
  if (blocked) return blocked;
  const { source } = await req.json().catch(() => ({}));
  const result = await runSync(String(source || process.env.ADMIN_STORIES_SRC || ""));
  return Response.json({ ...result, stories: listStories() });
}
