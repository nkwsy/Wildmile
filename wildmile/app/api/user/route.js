import { NextResponse } from "next/server";
import { getSession } from "lib/getSession";
import { createUser, findUserByEmail, updateUserByEmail } from "lib/db/user";
import userValidationSchema from "validation/user";
// import dbConnect from "lib/db/setup";

export async function GET() {
  try {
    // await dbConnect();
    const user = await getSession();
    if (!user) {
      return NextResponse.json({});
    }

    const { email, ranger, admin, profile, _id } = user;
    return NextResponse.json({
      user: {
        email,
        ranger: ranger || false,
        admin: admin || false,
        profile,
        _id,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // await dbConnect();
    const data = await request.json();
    await userValidationSchema.validate(data, { abortEarly: false });

    if (await findUserByEmail(data.email)) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    const user = await createUser(data);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(request) {
  try {
    // await dbConnect();
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { email, password, name, location, picture } = data;

    const updatedUser = await updateUserByEmail(user.email, {
      email,
      password,
      profile: { name, location, picture },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
