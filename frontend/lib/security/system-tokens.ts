import { randomBytes } from "crypto"
import bcrypt from "bcryptjs"

const SYSTEM_TOKEN_BYTES = 32
const SYSTEM_TOKEN_PREFIX = "evsys"
const SYSTEM_TOKEN_COST = 12

export async function generateSystemSecretHash() {
  const rawToken = `${SYSTEM_TOKEN_PREFIX}_${randomBytes(SYSTEM_TOKEN_BYTES).toString("base64url")}`
  const tokenHash = await bcrypt.hash(rawToken, SYSTEM_TOKEN_COST)

  return {
    rawToken,
    tokenHash,
  }
}

export async function verifySystemSecret(rawToken: string, tokenHash: string) {
  return bcrypt.compare(rawToken, tokenHash)
}
