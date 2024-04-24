import { createRouter } from "next-connect";
import auth from "../../middleware/auth";
import passport from "../../config/passport";
import { NextConnectOptions } from "../../config/nextconnect";

const router = createRouter(NextConnectOptions);

router.use(auth).post(passport.authenticate("local"), (req, res) => {
  const { email, ranger, admin, user_profile, _id } = req.user;
  const profile = {
    name: "",
    location: "",
  };
  return res.json({
    user: {
      _id,
      email,
      ranger: ranger || false,
      admin,
      profile: { ...profile, ...user_profile },
    },
  });
});

export default router.handler({
  onError: (err, req, res) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).end(err.message);
  },
});
