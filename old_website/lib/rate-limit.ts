import { headers } from "next/headers"

import { db } from "@/lib/db"

type RateLimitOptions = {
  action: string
  identifiers: string[]
  limit: number
  windowMs: number
}

export class RateLimitError extends Error {
  retryAfterSeconds: number

  constructor(retryAfterSeconds: number) {
    super("Too many attempts. Please try again later.")
    this.name = "RateLimitError"
    this.retryAfterSeconds = retryAfterSeconds
  }
}

export async function getClientIp() {
  const headerList = await headers()
  const forwardedFor = headerList.get("x-forwarded-for")?.split(",")[0]?.trim()

  return forwardedFor || headerList.get("x-real-ip") || "unknown"
}

export function normalizeRateLimitEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() || null
}

export async function enforceRateLimit({
  action,
  identifiers,
  limit,
  windowMs,
}: RateLimitOptions) {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + windowMs)
  const uniqueIdentifiers = [...new Set(identifiers.filter(Boolean))]

  for (const key of uniqueIdentifiers) {
    const existing = await db.authRateLimit.findUnique({
      where: {
        action_key: {
          action,
          key,
        },
      },
    })

    if (!existing || existing.expiresAt <= now) {
      await db.authRateLimit.upsert({
        where: {
          action_key: {
            action,
            key,
          },
        },
        create: {
          action,
          key,
          count: 1,
          expiresAt,
        },
        update: {
          count: 1,
          expiresAt,
        },
      })
      continue
    }

    if (existing.count >= limit) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((existing.expiresAt.getTime() - now.getTime()) / 1000)
      )
      throw new RateLimitError(retryAfterSeconds)
    }

    await db.authRateLimit.update({
      where: {
        action_key: {
          action,
          key,
        },
      },
      data: {
        count: { increment: 1 },
      },
    })
  }
}

export function formatRetryMessage(seconds: number) {
  const minutes = Math.max(1, Math.ceil(seconds / 60))

  return `Too many attempts. Please wait about ${minutes} minute${minutes === 1 ? "" : "s"} before trying again.`
}
