import { getLoginSession } from "lib/auth";
import { cookies, headers } from "next/headers";

export async function getSession() {
  const cookieStore = cookies();
  const token = cookieStore.get("session");
  const session = await getLoginSession(token.value, process.env.TOKEN_SECRET);
  return session.passport.user;
}
