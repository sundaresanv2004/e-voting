import "server-only"

import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const secretKey = process.env.VOTING_SECRET || process.env.BETTER_AUTH_SECRET || "default_insecure_secret_for_dev_only"
const encodedKey = new TextEncoder().encode(secretKey)

// Cookie name is scoped per election so a ticket for one election
// cannot be used to access a different election's portal.
function cookieName(electionId: string) {
    return `election_access_${electionId}`
}

export type AccessTicketPayload = {
    electionId: string
}

/**
 * Issues a signed entrance ticket cookie for the given election.
 * Called server-side after a voter successfully validates an access code.
 *
 * @param electionId - The election this ticket grants access to.
 * @param endTime    - The election's own end time; the cookie expires then.
 */
export async function createAccessTicket(electionId: string, endTime: Date): Promise<void> {
    const now = new Date()

    const jwt = await new SignJWT({ electionId } satisfies AccessTicketPayload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(Math.floor(endTime.getTime() / 1000)) // Unix epoch seconds
        .sign(encodedKey)

    const cookieStore = await cookies()
    cookieStore.set(cookieName(electionId), jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        // maxAge is intentionally omitted. This creates a "Session Cookie",
        // which the browser automatically deletes when Chrome is completely closed.
    })
}

/**
 * Verifies that the caller holds a valid entrance ticket for the given election.
 * Returns the payload on success, null if the cookie is absent, expired, or tampered.
 *
 * @param electionId - The election to check access for.
 */
export async function verifyAccessTicket(electionId: string): Promise<AccessTicketPayload | null> {
    const cookieStore = await cookies()
    const raw = cookieStore.get(cookieName(electionId))?.value

    if (!raw) return null

    try {
        const { payload } = await jwtVerify(raw, encodedKey, {
            algorithms: ["HS256"],
        })
        return payload as AccessTicketPayload
    } catch {
        // Expired, tampered, or invalid — deny access
        return null
    }
}

/**
 * Clears the entrance ticket cookie for the given election.
 * Called after a ballot is successfully submitted to prevent session reuse.
 *
 * @param electionId - The election whose ticket should be cleared.
 */
export async function clearAccessTicket(electionId: string): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete(cookieName(electionId))
}
