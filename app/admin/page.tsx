import { notFound } from "next/navigation";
import type { Metadata } from "next";
import AdminApp from "@/components/admin/AdminApp";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

// Only exists while running `npm run dev`. The deployed site returns 404.
export default function AdminPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <AdminApp defaultSource={process.env.ADMIN_STORIES_SRC ?? ""} />;
}
