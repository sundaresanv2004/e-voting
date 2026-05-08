import { createHash, randomBytes, randomInt } from "crypto"

import { db } from "@/lib/db"
import {
  AUTH_TOKEN_RESEND_COOLDOWN_MS,
  AUTH_TOKEN_TTL_MS,
  MAX_AUTH_TOKEN_ATTEMPTS,
} from "@/lib/auth/timing"

export const MAX_TOKEN_ATTEMPTS = MAX_AUTH_TOKEN_ATTEMPTS

export class TokenThrottleError extends Error {
  retryAfterSeconds: number

  constructor(retryAfterSeconds: number) {
    super("Please wait before requesting another code.")
    this.name = "TokenThrottleError"
    this.retryAfterSeconds = retryAfterSeconds
  }
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

function getExpiryDate() {
  return new Date(Date.now() + AUTH_TOKEN_TTL_MS)
}

function assertCanSend(lastSentAt: Date | null | undefined) {
  if (!lastSentAt) return

  const nextAllowedAt = lastSentAt.getTime() + AUTH_TOKEN_RESEND_COOLDOWN_MS
  if (nextAllowedAt > Date.now()) {
    throw new TokenThrottleError(
      Math.max(1, Math.ceil((nextAllowedAt - Date.now()) / 1000))
    )
  }
}

export const generateVerificationToken = async (email: string) => {
  const token = randomInt(100000, 1000000).toString()
  const tokenHash = hashToken(token)
  const expires = getExpiryDate()

  const existingToken = await db.verificationToken.findFirst({
    where: {
      identifier: email,
      consumedAt: null,
      expires: { gt: new Date() },
    },
    orderBy: { lastSentAt: "desc" },
  })

  assertCanSend(existingToken?.lastSentAt)

  await db.verificationToken.deleteMany({
    where: { identifier: email },
  })

  const verificationToken = await db.verificationToken.create({
    data: {
      identifier: email,
      token: tokenHash,
      expires,
      lastSentAt: new Date(),
    },
  })

  return {
    ...verificationToken,
    token,
  }
}

export const generatePasswordResetToken = async (email: string) => {
  const token = randomBytes(32).toString("base64url")
  const tokenHash = hashToken(token)
  const expires = getExpiryDate()

  const existingToken = await db.passwordResetToken.findFirst({
    where: {
      email,
      consumedAt: null,
      expires: { gt: new Date() },
    },
    orderBy: { lastSentAt: "desc" },
  })

  assertCanSend(existingToken?.lastSentAt)

  await db.passwordResetToken.deleteMany({
    where: { email },
  })

  const passwordResetToken = await db.passwordResetToken.create({
    data: {
      email,
      token: tokenHash,
      expires,
      lastSentAt: new Date(),
    },
  })

  return {
    ...passwordResetToken,
    token,
  }
}

export const getPasswordResetTokenByRawToken = async (token: string) => {
  return db.passwordResetToken.findUnique({
    where: { token: hashToken(token) },
  })
}

export const getVerificationTokenByRawToken = async (email: string, token: string) => {
  return db.verificationToken.findUnique({
    where: {
      identifier_token: {
        identifier: email,
        token: hashToken(token),
      },
    },
  })
}
