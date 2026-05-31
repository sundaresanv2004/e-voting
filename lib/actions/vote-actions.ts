"use server"

import { db } from "@/lib/db"
import { format } from "date-fns"

// ─── Types ─────────────────────────────────────────────────────────────────

export type ValidateCodeResult =
    | { success: true; electionId: string; name: string; code: string; categoryId?: string; categoryName?: string }
    | { error: string }

export type VerifyVoterResult =
    | {
        success: true
        voter: {
            id: string
            uniqueId: string
            name: string
            image: string | null
            additionalDetails: unknown
            ballotsCount: number
            maxVotes: number
        }
        ballot: {
            id: string
            name: string
            settings: {
                showCandidateProfiles: boolean
                showCandidateSymbols: boolean
                shuffleCandidates: boolean
                allowNota: boolean
            }
            roles: Array<{
                id: string
                name: string
                order: number
                candidates: Array<{
                    id: string
                    name: string
                    profileImage: string | null
                    symbolImage: string | null
                }>
            }>
        }
    }
    | { error: string; status?: string }

export type SubmitBallotResult = { success: true } | { error: string; status?: string }

// ─── Step 1: Validate Election Code (stub — full logic in vote_logic.md) ──────

export async function validateElectionCodeAction(code: string): Promise<ValidateCodeResult> {
    if (!code?.trim()) {
        return { error: "Election code is required." }
    }

    const normalizedCode = code.trim().toUpperCase()

    try {
        // Step 1.1 – Check if it's a direct Election.code
        const election = await db.election.findUnique({
            where: { code: normalizedCode },
            include: { settings: true },
        })

        if (election) {
            // Step 1.2 – allowOnlineVoting
            if (!election.settings?.allowOnlineVoting) {
                return { error: "Voting is disabled. Please contact your organization or election administrator." }
            }

            // Step 1.3 – Timeframe
            const now = new Date()
            if (now < election.startTime) {
                const formattedDate = format(election.startTime, "EEEE, do MMMM yyyy")
                const formattedTime = format(election.startTime, "hh:mm a")
                return { error: `Voting opens on ${formattedDate} at ${formattedTime}.` }
            }
            if (now > election.endTime) {
                return { error: "This election has ended." }
            }

            return {
                success: true,
                electionId: election.id,
                name: election.name,
                code: normalizedCode,
            }
        }

        // Step 1.1b – Check if it's an ElectionCategory.code
        const category = await db.electionCategory.findFirst({
            where: { code: normalizedCode },
            include: {
                election: {
                    include: { settings: true },
                },
            },
        })

        if (category) {
            const { election: catElection } = category

            // Step 1.2 – allowOnlineVoting
            if (!catElection.settings?.allowOnlineVoting) {
                return { error: "Voting is disabled. Please contact your organization or election administrator." }
            }

            // Step 1.3 – Timeframe
            const now = new Date()
            if (now < catElection.startTime) {
                const formattedDate = format(catElection.startTime, "EEEE, do MMMM yyyy")
                const formattedTime = format(catElection.startTime, "hh:mm a")
                return { error: `Voting opens on ${formattedDate} at ${formattedTime}.` }
            }
            if (now > catElection.endTime) {
                return { error: "This election has ended." }
            }

            return {
                success: true,
                electionId: catElection.id,
                name: catElection.name,
                code: normalizedCode,
                categoryId: category.id,
                categoryName: category.name,
            }
        }

        // Step 1.1 – No match found
        return { error: "Invalid access code. Please check your code and try again." }
    } catch (error) {
        console.error("[VALIDATE_ELECTION_CODE]", error)
        return { error: "Something went wrong. Please try again." }
    }
}

// ─── Step 2: Verify Voter ID (stub — full logic to be added) ─────────────────

export async function verifyVoterUniqueIdAction(
    electionId: string,
    uniqueId: string,
    categoryId?: string
): Promise<VerifyVoterResult> {
    // TODO: Implement full voter verification logic per vote_logic.md
    return { error: "Voter verification is not yet implemented." }
}

// ─── Step 3: Submit Ballot (stub — full logic to be added) ───────────────────

export async function submitBallotAction(
    electionId: string,
    voterId: string,
    votes: Record<string, string>
): Promise<SubmitBallotResult> {
    // TODO: Implement full ballot submission logic per vote_logic.md
    return { error: "Ballot submission is not yet implemented." }
}
