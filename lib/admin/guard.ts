import { safeName } from "./core";

/** Admin only exists on `npm run dev`. On the deployed site every admin route is a 404. */
export function devOnly(): Response | null {
  return process.env.NODE_ENV === "development" ? null : new Response("Not found", { status: 404 });
}

export function badFolder(folder: unknown): Response | null {
  return typeof folder === "string" && safeName(folder) ? null : Response.json({ error: "Invalid story folder." }, { status: 400 });
}
