import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import Achievement from "models/users/Achievement";
import { getSession } from "lib/getSession";
import { headers } from "next/headers";

export async function GET() {
  try {
    const session = await getSession({ headers });
    if (!session?.admin && !session?.role?.includes("admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const achievements = await Achievement.find().sort({ level: 1, name: 1 });
    return NextResponse.json(achievements);
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return NextResponse.json(
      { error: "Failed to fetch achievements" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getSession({ headers });
    if (!session?.admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const data = await request.json();
    const achievement = await Achievement.create(data);
    return NextResponse.json(achievement);
  } catch (error) {
    console.error("Error creating achievement:", error);
    return NextResponse.json(
      { error: "Failed to create achievement" },
      { status: 500 }
    );
  }
}
