import passport from "passport";
import LocalStrategy from "passport-local";
import { findUserByEmail } from "../lib/db/user";

passport.serializeUser((user, done) => {
  done(null, user.email);
});

passport.deserializeUser(function (email, done) {
  console.log("deserializeUser", email);
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
      // Here you lookup the user in your DB and compare the password/hashed password
      const user = await findUserByEmail(email);

      if (!user) {
        return done(null, false, { msg: `Email ${email} not found.` });
      }

      if (!(await user.comparePassword(password))) {
        return done(null, false, { msg: "Invalid email or password." });
      } else {
        return done(null, user);
      }
    }
  )
);

export default passport;
