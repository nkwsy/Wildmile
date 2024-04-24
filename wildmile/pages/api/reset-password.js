// pages/api/reset-password.js

import { createRouter } from "next-connect";
import User from "../../models/User";
import { NextConnectOptions } from "../../config/nextconnect";

const router = createRouter(NextConnectOptions);

router.post(async (req, res) => {
  const { token, password } = req.body;
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return res
      .status(400)
      .json({ message: "Password reset token is invalid or has expired." });
  }

  console.log("user", user);
  user.password = password;
  user.markModified("password"); // Add this line
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  console.log("user", user);
  await user.save();
  res.json({ message: "Your password has been changed successfully." });
});

export default router.handler({
  onError: (err, req, res) => {
    console.error(err.stack);
    res.status(500).end(err.message);
  },
});
