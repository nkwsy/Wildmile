import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import { updateUserProgress } from "app/actions/UserActions";
import { getSession } from "lib/getSession";
import { headers } from "next/headers";

export async function GET(request) {
  await dbConnect();

  const session = await getSession({ headers });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session._id;
  const stats = await updateUserProgress(userId);

  return NextResponse.json({ stats });
}

export async function POST(request) {
  await dbConnect();
  // userId is expected from the request body.
  // The `stats` field from the body will be ignored as updateUserProgress triggers a full recalculation.
  const { userId } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    // Call the refactored updateUserProgress function
    // This function now internally calls updateUserStats, which handles all calculations,
    // streak updates, achievement checks, and saving UserProgress.
    // It returns { success, newAchievements, progressData, error }
    const result = await updateUserProgress(userId);

    if (result.success) {
      return NextResponse.json({
        progress: result.progressData, // This contains the comprehensive progress details
        newAchievements: result.newAchievements,
      });
    } else {
      // If updateUserProgress failed, return an error response
      return NextResponse.json(
        { error: result.error || "Failed to update progress" },
        { status: 500 }
      );
    }
  } catch (error) {
    // Catch any unexpected errors during the process
    console.error("Error in POST /api/user/progress/update:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
