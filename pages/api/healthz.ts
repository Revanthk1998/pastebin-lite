import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await clientPromise;
    res.status(200).json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
}
