import { db } from "@/lib/db"
import { normalizeRateLimitEmail } from "@/lib/rate-limit"

export async function findUserByLoginEmail(email: string) {
  const trimmedEmail = email.trim()
  const normalizedEmail = normalizeRateLimitEmail(trimmedEmail)

  if (!normalizedEmail) return null

  const exactUser = await db.user.findFirst({
    where: {
      OR: [
        { email: trimmedEmail },
        { email: normalizedEmail },
      ],
    },
  })

  if (exactUser) return exactUser

  return db.user.findFirst({
    where: {
      email: {
        equals: normalizedEmail,
        mode: "insensitive",
      },
    },
  })
}

export async function findLoginLockByEmail(email: string) {
  const user = await findUserByLoginEmail(email)

  return user ? { lockedUntil: user.lockedUntil } : null
}
