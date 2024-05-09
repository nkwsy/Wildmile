"use server";
import { getLoginSession } from "lib/auth";
import { cookies, headers } from "next/headers";
// import User from "models/User";
import { findUserByEmail } from "./db/user";

export async function getSession() {
  const cookieStore = cookies();
  const token = cookieStore.get("session");
  try {
    const session = await getLoginSession(
      token ? token.value : null,
      process.env.TOKEN_SECRET
    );
    if (!session || !session.passport || !session.passport.user) {
      console.log("Session is invalid or incomplete");
      return null;
    }
    console.log("Session:", session);
    console.log("User:", typeof session.passport.user);
    const user = await findUserByEmail(session.passport.user);
    console.log("User:", user);
    return user;
  } catch (error) {
    console.error("Failed to retrieve user session:", error);
    return null;
  }
}
