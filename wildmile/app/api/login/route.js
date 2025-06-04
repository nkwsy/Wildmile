import { NextResponse } from "next/server";
import { createLoginSession } from "lib/auth";
import { cookies } from "next/headers";
import dbConnect from "lib/db/setup";
import { findUserByEmail } from "lib/db/user";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    const { email, password } = data;

    const user = await findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create session
    const session = {
      passport: { user: email },
      maxAge: 60 * 60 * 24 * 7 * 2, // 2 weeks
    };

    const token = await createLoginSession(session, process.env.TOKEN_SECRET);
    (await cookies()).set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7 * 2, // 2 weeks
    });

    const { ranger, admin, profile, _id } = user;
    return NextResponse.json({
      user: {
        _id,
        email,
        ranger: ranger || false,
        admin,
        profile: {
          name: "",
          location: "",
          ...profile,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
