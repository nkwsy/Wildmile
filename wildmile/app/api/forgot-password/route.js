import { NextResponse } from "next/server";
import User from "models/User";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { email } = await request.json();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "No account with that email address exists." },
        { status: 404 }
      );
    }

    const token = crypto.randomBytes(20).toString("hex");

    await User.updateOne(
      { email: user.email },
      {
        passwordResetToken: token,
        passwordResetExpires: Date.now() + 3600000,
      }
    );

    const { data, error } = await resend.emails.send({
      to: email,
      from: "noreply@rangers.urbanrivers.org",
      subject: "Password Reset",
      html: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        http://${request.headers.get("host")}/reset-password/${token}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    });

    if (error) {
      throw new Error("Error sending password reset email");
    }

    return NextResponse.json({
      message: `An e-mail has been sent to ${email} with further instructions.`,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
