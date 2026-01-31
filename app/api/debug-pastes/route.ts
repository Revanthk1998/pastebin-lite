import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const pastes = await client
    .db()
    .collection("pastes")
    .find({})
    .limit(5)
    .toArray();

  return NextResponse.json(pastes);
}
