import { createRouter } from "next-connect";
import passport from "config/passport";
import session from "lib/session";
import dbConnect from "lib/db/setup";
import MongoStore from "connect-mongo";

const auth = createRouter();

auth
  .use(async (req, res, next) => {
    await dbConnect();
    await next();
  })
  .use(
    session({
      resave: true,
      saveUninitialized: true,
      secret: process.env.TOKEN_SECRET,
      cookie: {
        maxAge: 2 * 7 * 24 * 60 * 60 * 1000, // Two weeks in milliseconds
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
      },
      store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    })
  )
  .use(passport.initialize())
  .use(passport.session());

export default auth;
