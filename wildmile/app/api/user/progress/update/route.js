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
  const { userId, stats } = await request.json();

  try {
    let progress = await UserProgress.findOne({ user: userId });
    if (!progress) {
      progress = new UserProgress({ user: userId });
    }

    // Update stats
    Object.assign(progress.stats, stats);

    // Update streak
    progress.updateStreak();

    // Check for new achievements
    const newAchievements = await progress.checkAchievements();

    await progress.save();

    return NextResponse.json({
      progress,
      newAchievements,
    });
  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}
