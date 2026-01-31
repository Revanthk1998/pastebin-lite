export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

function getNow(req: NextRequest): number {
  if (process.env.TEST_MODE === "1") {
    const header = req.headers.get("x-test-now-ms");
    if (header) {
      const parsed = Number(header);
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return Date.now();
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params; // ✅ unwrap params

  const client = await clientPromise;
  const collection = client.db().collection("pastes");

  const paste = await collection.findOne({ _id: id });

  if (!paste) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const now = getNow(req);

  if (paste.expiresAt && new Date(paste.expiresAt).getTime() <= now) {
    return NextResponse.json({ error: "Expired" }, { status: 404 });
  }

  if (
    paste.maxViews !== null &&
    paste.maxViews !== undefined &&
    paste.views >= paste.maxViews
  ) {
    return NextResponse.json(
      { error: "View limit exceeded" },
      { status: 404 }
    );
  }

  await collection.updateOne(
    { _id: id },
    { $inc: { views: 1 } }
  );

  return NextResponse.json({
    content: paste.content,
    remaining_views:
      paste.maxViews == null ? null : paste.maxViews - (paste.views + 1),
    expires_at: paste.expiresAt
      ? new Date(paste.expiresAt).toISOString()
      : null,
  });
}
