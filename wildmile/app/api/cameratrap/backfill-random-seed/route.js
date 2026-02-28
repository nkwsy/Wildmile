import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import CameratrapMedia from "models/cameratrap/Media";
import { getSession } from "lib/getSession";

export const maxDuration = 300;

/**
 * One-time migration endpoint: backfills the randomSeed field on all
 * CameratrapMedia documents that don't have one yet.
 *
 * Uses MongoDB's $rand aggregation operator in an updateMany pipeline
 * so the entire backfill runs server-side in a single command — no
 * documents are transferred to the app server.
 *
 * Restricted to SuperAdmin and CameraAdmin roles.
 * Safe to re-run: only touches documents missing the field.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (
      !session ||
      (!session.admin &&
        !session.roles?.includes("SuperAdmin") &&
        !session.roles?.includes("CameraAdmin"))
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

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
