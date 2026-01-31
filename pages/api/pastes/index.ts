import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";
import { nanoid } from "nanoid";

type PasteDoc = {
  _id: string;
  content: string;
  expiresAt: Date | null;
  maxViews: number | null;
  views: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { content, ttl_seconds, max_views } = req.body;

    // ✅ Validation
    if (!content || typeof content !== "string") {
      return res.status(400).json({ error: "Invalid content" });
    }

    if (
      ttl_seconds !== undefined &&
      (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)
    ) {
      return res.status(400).json({ error: "Invalid ttl_seconds" });
    }

    if (
      max_views !== undefined &&
      (!Number.isInteger(max_views) || max_views < 1)
    ) {
      return res.status(400).json({ error: "Invalid max_views" });
    }

    const client = await clientPromise;
    const collection = client
      .db()
      .collection<PasteDoc>("pastes");

    const id = nanoid(8);
    const expiresAt =
      ttl_seconds !== undefined
        ? new Date(Date.now() + ttl_seconds * 1000)
        : null;

    await collection.insertOne({
      _id: id,
      content,
      expiresAt,
      maxViews: max_views ?? null,
      views: 0,
    });

    return res.status(200).json({
      id,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/p/${id}`,
    });
  } catch (err) {
    console.error("POST /api/pastes error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
