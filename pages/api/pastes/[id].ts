import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";

type PasteDoc = {
  _id: string;
  content: string;
  expiresAt: Date | null;
  maxViews: number | null;
  views: number;
};

function getNow(req: NextApiRequest): number {
  if (process.env.TEST_MODE === "1") {
    const header = req.headers["x-test-now-ms"];
    if (header) {
      const parsed = Number(header);
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return Date.now();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(404).json({ error: "Not found" });
  }

  const client = await clientPromise;
  const collection = client
    .db()
    .collection<PasteDoc>("pastes"); // ✅ FIX

  const paste = await collection.findOne({ _id: id }); // ✅ NO ERROR

  if (!paste) {
    return res.status(404).json({ error: "Not found" });
  }

  const now = getNow(req);

  if (paste.expiresAt && paste.expiresAt.getTime() <= now) {
    return res.status(404).json({ error: "Expired" });
  }

  if (paste.maxViews !== null && paste.views >= paste.maxViews) {
    return res.status(404).json({ error: "View limit exceeded" });
  }

  await collection.updateOne(
    { _id: id },
    { $inc: { views: 1 } }
  );

  return res.status(200).json({
    content: paste.content,
    remaining_views:
      paste.maxViews === null
        ? null
        : paste.maxViews - (paste.views + 1),
    expires_at: paste.expiresAt
      ? paste.expiresAt.toISOString()
      : null,
  });
}
