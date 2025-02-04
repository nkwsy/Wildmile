import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import Achievement from "models/users/Achievement";
import { getSession } from "lib/getSession";
import { headers } from "next/headers";
import UserProgress from "models/users/UserProgress";

export async function PUT(request, { params }) {
  try {
    const session = await getSession({ headers });
    if (!session?.admin && !session?.role?.includes("Admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const data = await request.json();
    const achievement = await Achievement.findByIdAndUpdate(params.id, data, {
      new: true,
    });
    return NextResponse.json(achievement);
  } catch (error) {
    console.error("Error updating achievement:", error);
    return NextResponse.json(
      { error: "Failed to update achievement" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getSession({ headers });
    if (!session?.admin && !session?.role?.includes("Admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Delete the achievement
    await Achievement.findByIdAndDelete(params.id);

    // Remove the achievement from all user progress records
    await UserProgress.updateMany(
      { "achievements.achievementId": params.id },
      { $pull: { achievements: { achievementId: params.id } } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting achievement:", error);
    return NextResponse.json(
      { error: "Failed to delete achievement" },
      { status: 500 }
    );
  }
}
