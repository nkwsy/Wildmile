import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import CameratrapMedia from "models/cameratrap/Media";

export const maxDuration = 300;

/**
 * One-time migration endpoint: backfills the randomSeed field on all
 * CameratrapMedia documents that don't have one yet.
 *
 * Uses MongoDB's $rand aggregation operator in an updateMany pipeline
 * so the entire backfill runs server-side in a single command — no
 * documents are transferred to the app server.
 *
 * Hit this once after deploying the randomSeed schema change:
 *   GET /api/cameratrap/backfill-random-seed
 *
 * Safe to re-run: only touches documents missing the field.
 */
export async function GET() {
  try {
    await dbConnect();

    const result = await CameratrapMedia.updateMany(
      { randomSeed: { $exists: false } },
      [{ $set: { randomSeed: { $rand: {} } } }]
    );

    return NextResponse.json({
      message: "Backfill complete",
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error backfilling randomSeed:", error);
    return NextResponse.json(
      { message: "Error backfilling randomSeed", error: error.message },
      { status: 500 }
    );
  }
}
