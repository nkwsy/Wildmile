"use server";
import { getLoginSession } from "lib/auth";
import { cookies, headers } from "next/headers";
import { getIronSession } from "iron-session";
// import User from "models/User";
import { findUserByEmail } from "./db/user";

export async function getSession() {
  const sessionOptions = {
    password: process.env.TOKEN_SECRET,
    cookieName: "session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7 * 2, // 2 weeks
      sameSite: "lax",
    }
  };
  const session = await getIronSession(cookies(), sessionOptions);  if (!session || !session.passport || !session.passport.user) {
    return null;
  }
  if (session.passport.user) {
    const user = await findUserByEmail(session.passport.user);
    return user;
  }
  return session;
}