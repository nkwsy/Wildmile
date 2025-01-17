import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import User from "models/User";
import { getSession } from "lib/getSession";

export async function GET(request) {
  try {
    await dbConnect();
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("searchTerm");
    const hasRoles = searchParams.get("hasRoles");

    let query = {};

    if (searchTerm) {
      query = {
        $or: [
          { email: { $regex: searchTerm, $options: "i" } },
          { "profile.name": { $regex: searchTerm, $options: "i" } },
        ],
      };
    } else if (hasRoles) {
      // Find users that have at least one role
      query = {
        roles: { $exists: true, $ne: [] },
      };
    }

    const users = await User.find(query)
      .select("email profile.name roles")
      .sort({ "profile.name": 1, email: 1 });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error finding users:", error);
    return NextResponse.json(
      { message: error.message || "Failed to find users" },
      { status: 500 }
    );
  }
}
