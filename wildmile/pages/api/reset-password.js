// pages/api/reset-password.js

import { createRouter } from "next-connect";
import User from "../../models/User";
import { NextConnectOptions } from "../../config/nextconnect";

const router = createRouter(NextConnectOptions);

router.post(async (req, res) => {
  const { token, password } = req.body;
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res
      .status(400)
      .json({ message: "Password reset token is invalid or has expired." });
  }

  user.password = password; // Ensure password is hashed according to your user model's specifications
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: "Your password has been changed successfully." });
});

export default router.handler({
  onError: (err, req, res) => {
    console.error(err.stack);
    res.status(500).end(err.message);
  },
});
