import { getLoginSession } from "lib/auth";
import { cookies, headers } from "next/headers";
import User from "models/User";

export async function getSession() {
  const cookieStore = cookies();
  const token = cookieStore.get("session");
  const session = await getLoginSession(token.value, process.env.TOKEN_SECRET);
  if (!session) {
    return null;
  }
  user = await User.findOne({ email: session.passport.user });
  return user;
}
