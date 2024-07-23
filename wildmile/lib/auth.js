import { getIronSession, sealData, unsealData } from "iron-session";
import { cookies } from "next/headers";

const fifteenMinutesInSeconds = 60 * 15;

export async function createLoginSession(session, secret) {
  const createdAt = Date.now()
  const obj = { ...session, createdAt }
  const token = await sealData(obj, {
    password: secret,
    ttl:  fifteenMinutesInSeconds
  })

  return token
}

export async function getLoginSession(token, secret) {
  const session = await unsealData(token, {
    password: secret,
    ttl: fifteenMinutesInSeconds
  })
  const expiresAt = session.createdAt + session.maxAge * 1000

  // Validate the expiration date of the session
  if (session.maxAge && Date.now() > expiresAt) {
    throw new Error('Session expired')
  }

  return session
}
