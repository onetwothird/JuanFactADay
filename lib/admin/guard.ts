import { requestAllowed, safeName } from "./core";

/** Admin only exists on `npm run dev`. On the deployed site every admin route is a 404. */
export function devOnly(req: Request): Response | null {
  if (process.env.NODE_ENV !== "development") return new Response("Not found", { status: 404 });
  // next dev listens on the whole network: only accept requests from this computer's own admin page.
  if (!requestAllowed(req.headers.get("host"), req.headers.get("origin")))
    return Response.json({ error: "Admin only accepts requests from this computer." }, { status: 403 });
  return null;
}

export function badFolder(folder: unknown): Response | null {
  return typeof folder === "string" && safeName(folder) ? null : Response.json({ error: "Invalid story folder." }, { status: 400 });
}
