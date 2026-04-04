import { db } from "@/lib/db"

export const generateVerificationToken = async (email: string) => {
  // Generate a random 6-digit number
  const token = Math.floor(100000 + Math.random() * 900000).toString()
  
  // Set the token to expire in 1 hour
  const expires = new Date(new Date().getTime() + 3600 * 1000)

  // Verify if a token already exists for this email
  const existingToken = await db.verificationToken.findFirst({
    where: { identifier: email }
  })

  // If a token already exists, delete it first to avoid unique key conflicts
  if (existingToken) {
    await db.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: existingToken.identifier,
          token: existingToken.token
        }
      }
    })
  }

  // Create the new verification token
  const verificationToken = await db.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires
    }
  })

  return verificationToken
}

export const generatePasswordResetToken = async (email: string) => {
  const token = crypto.randomUUID()
  const expires = new Date(new Date().getTime() + 3600 * 1000) // 1 hour

  const existingToken = await db.passwordResetToken.findFirst({
    where: { email }
  })

  if (existingToken) {
    await db.passwordResetToken.delete({
      where: { id: existingToken.id }
    })
  }

  const passwordResetToken = await db.passwordResetToken.create({
    data: {
      email,
      token,
      expires
    }
  })

  return passwordResetToken
}
