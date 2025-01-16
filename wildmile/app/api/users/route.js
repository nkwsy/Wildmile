import { NextResponse } from "next/server";
import { getAllUsers } from "lib/db/user";
import { getSession } from "lib/getSession";
import dbConnect from "lib/db/setup";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    const start = Date.now();
    const user = await getSession();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await getAllUsers();
    const end = Date.now();
    console.log(`Request took ${end - start}ms`);

    return NextResponse.json({ users });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
