import clientPromise from "@/lib/mongodb";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PastePage({ params }: PageProps) {
  // 🔑 UNWRAP params (required in Next.js 15+)
  const { id } = await params;

  const client = await clientPromise;
  const paste = await client
    .db()
    .collection("pastes")
    .findOne({ _id: id });

  if (!paste) notFound();

  // TTL check
  if (paste.expiresAt && new Date(paste.expiresAt).getTime() <= Date.now()) {
    notFound();
  }

  // View limit check (HTML does NOT increment views)
  if (
    paste.maxViews !== null &&
    paste.maxViews !== undefined &&
    paste.views >= paste.maxViews
  ) {
    notFound();
  }

  return (
    <pre style={{ whiteSpace: "pre-wrap", padding: 20 }}>
      {paste.content}
    </pre>
  );
}
