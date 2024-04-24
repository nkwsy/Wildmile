// pages/api/forgot-password.js

import { createRouter } from "next-connect";
import User from "../../models/User";
// import nodemailer from "nodemailer";
import { Resend } from "resend";
import crypto from "crypto";
import { NextConnectOptions } from "../../config/nextconnect";

const router = createRouter(NextConnectOptions);

const transporter = new Resend(process.env.RESEND_API_KEY);
router.post(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(404)
      .json({ message: "No account with that email address exists." });
  }

  const token = await new Promise((resolve, reject) => {
    crypto.randomBytes(20, (err, buf) => {
      if (err) reject(err);
      resolve(buf.toString("hex"));
    });
  });

  await User.updateOne(
    { email: user.email }, // Filter condition
    {
      passwordResetToken: token,
      passwordResetExpires: Date.now() + 3600000, // 1 hour
    }
  );

  const mailOptions = {
    to: email,
    from: "noreply@rangers.urbanrivers.org",
    subject: "Password Reset",
    html: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
      Please click on the following link, or paste this into your browser to complete the process:\n\n
      http://${req.headers.host}/reset-password/${token}\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.\n`,
  };

  const { data, error } = await transporter.emails.send(mailOptions);
  if (error) {
    return console.error("error sending password reset email", { error });
  }
  res.status(200).json({
    message:
      "An e-mail has been sent to " + email + " with further instructions.",
  });
});

export default router.handler({
  onError: (err, req, res) => {
    console.error(err.stack);
    res.status(500).end(err.message);
  },
});
