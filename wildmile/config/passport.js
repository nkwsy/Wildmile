import passport from "passport";
import LocalStrategy from "passport-local";
import { findUserByEmail } from "../lib/db/user";

passport.serializeUser((user, done) => {
  done(null, user.email);
});

passport.deserializeUser(function (email, done) {
  // deserialize the email back into user object
  findUserByEmail(email).then((user) => {
    done(null, user);
  });
});

/**
 * Sign in using Email and Password.
 */

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await findUserByEmail(email);
        if (!user || !(await user.comparePassword(password))) {
          return done(null, false, { msg: "Invalid email or password." });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

export default passport;
