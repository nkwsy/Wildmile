import { NextResponse } from "next/server";
import User from "models/User";

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Password reset token is invalid or has expired." },
        { status: 400 }
      );
    }

    user.password = password;
    user.markModified("password");
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();

    return NextResponse.json({
      message: "Your password has been changed successfully.",
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
