import updateAllUserStats from "lib/db/updateAllUserStats";
import { NextResponse } from "next/server";
export async function GET(request) {
  try {
    await updateAllUserStats();
    return NextResponse.json({ message: "Stats updated successfully" });
  } catch (error) {
    console.error("Error updating stats:", error);
    return NextResponse.json(
      { error: "Failed to update stats" },
      { status: 500 }
    );
  }
}
