import "server-only"

import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const secretKey = process.env.VOTING_SECRET || process.env.BETTER_AUTH_SECRET || "default_insecure_secret_for_dev_only"
const encodedKey = new TextEncoder().encode(secretKey)

export type VoterSessionPayload = {
    voterId: string
    electionId: string
    isAnonymous: boolean
}

export async function createVoterSession(payload: VoterSessionPayload) {
    const jwt = await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(encodedKey)

    const cookieStore = await cookies()
    cookieStore.set("voter_session", jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 24 * 60 * 60, // 24 hours
    })
}

export async function getVoterSession(): Promise<VoterSessionPayload | null> {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("voter_session")?.value

    if (!sessionCookie) {
        return null
    }

    try {
        const { payload } = await jwtVerify(sessionCookie, encodedKey, {
            algorithms: ["HS256"],
        })
        return payload as VoterSessionPayload
    } catch (error) {
        // JWT expired or invalid
        return null
    }
}

export async function clearVoterSession() {
    const cookieStore = await cookies()
    cookieStore.delete("voter_session")
}
