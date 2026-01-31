export const runtime = "nodejs";

import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const client = await clientPromise;
  const collection = client.db().collection("pastes");

  const paste = await collection.findOne({ _id: id });

  if (!paste) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (paste.expiresAt && new Date(paste.expiresAt).getTime() <= Date.now()) {
    return NextResponse.json({ error: "Expired" }, { status: 404 });
  }

  if (paste.maxViews != null && paste.views >= paste.maxViews) {
    return NextResponse.json(
      { error: "View limit exceeded" },
      { status: 404 }
    );
  }

  await collection.updateOne({ _id: id }, { $inc: { views: 1 } });

  return NextResponse.json({
    content: paste.content,
    remaining_views:
      paste.maxViews == null ? null : paste.maxViews - (paste.views + 1),
    expires_at: paste.expiresAt
      ? new Date(paste.expiresAt).toISOString()
      : null,
  });
}
