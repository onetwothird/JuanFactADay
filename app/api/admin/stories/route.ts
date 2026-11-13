import { devOnly } from "@/lib/admin/guard";
import { createStory, listStories } from "@/lib/admin/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const blocked = devOnly();
  if (blocked) return blocked;
  return Response.json({ stories: listStories(), syncSource: process.env.ADMIN_STORIES_SRC ?? "" });
}

export async function POST(req: Request) {
  const blocked = devOnly();
  if (blocked) return blocked;
  try {
    const { title } = await req.json();
    return Response.json({ story: createStory(String(title ?? "")) });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}
