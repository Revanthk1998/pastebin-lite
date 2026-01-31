import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  const { content, ttl_seconds, max_views } = await req.json();

  if (!content || typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "Invalid content" }, { status: 400 });
  }

  if (ttl_seconds !== undefined && (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)) {
    return NextResponse.json({ error: "Invalid ttl_seconds" }, { status: 400 });
  }

  if (max_views !== undefined && (!Number.isInteger(max_views) || max_views < 1)) {
    return NextResponse.json({ error: "Invalid max_views" }, { status: 400 });
  }

  const id = nanoid(8);
  const now = Date.now();

  const paste = {
    _id: id,
    content,
    created_at: now,
    expires_at: ttl_seconds ? now + ttl_seconds * 1000 : null,
    max_views: max_views ?? null,
    views: 0,
  };

  const client = await clientPromise;
  await client.db().collection("pastes").insertOne(paste);

  return NextResponse.json({
    id,
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/p/${id}`,
  });
}
