import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "lib/getSession";

export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    // Clear the session cookie
    cookies().delete("session");

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
