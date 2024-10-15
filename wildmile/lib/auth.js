import { getIronSession, sealData, unsealData } from "iron-session";
import { cookies } from "next/headers";

const oneMonthInSeconds = 60 * 60 * 24 * 30; // 30 days
const loginDuration = oneMonthInSeconds;

export async function createLoginSession(session, secret) {
  const createdAt = Date.now()
  const obj = { ...session, createdAt }
  const token = await sealData(obj, {
    password: secret,
    ttl:  loginDuration
  })

  return token
}

export async function getLoginSession(token, secret) {
  const session = await unsealData(token, {
    password: secret,
    ttl: loginDuration
  })
  const expiresAt = session.createdAt + session.maxAge * 1000

  // Validate the expiration date of the session
  if (session.maxAge && Date.now() > expiresAt) {
    throw new Error('Session expired')
  }

  return session
}
