import { NextResponse } from "next/server";
import dbConnect from "/lib/db/setup";
import Camera from "/models/cameratrap/Camera";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name").toUpperCase();

    if (!name) {
      return NextResponse.json(
        { message: "Name parameter is required" },
        { status: 400 }
      );
    }

    const exists = await Camera.exists({
      name: { $regex: new RegExp(name, "i") },
    });
    return NextResponse.json({ exists: !!exists });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to check name" },
      { status: 500 }
    );
  }
}
