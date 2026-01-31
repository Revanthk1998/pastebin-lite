export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

/**
 * Deterministic time support for automated tests
 */
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

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ REQUIRED in Next.js 16
    const { id } = await context.params;

    const client = await clientPromise;
    const collection = client.db().collection("pastes");

    const paste = await collection.findOne({ _id: id });

    // Missing paste
    if (!paste) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const now = getNow(req);

    // TTL check
    if (paste.expiresAt && new Date(paste.expiresAt).getTime() <= now) {
      return NextResponse.json({ error: "Expired" }, { status: 404 });
    }

    // View limit check
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

    // Increment views atomically
    await collection.updateOne(
      { _id: id },
      { $inc: { views: 1 } }
    );

    // API response must follow assignment spec
    return NextResponse.json({
      content: paste.content,
      remaining_views:
        paste.maxViews === null || paste.maxViews === undefined
          ? null
          : paste.maxViews - (paste.views + 1),
      expires_at: paste.expiresAt
        ? new Date(paste.expiresAt).toISOString()
        : null,
    });
  } catch (err) {
    console.error("GET /api/pastes/[id] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
