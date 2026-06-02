"use server"

import { db } from "@/lib/db"
import { format } from "date-fns"
import { headers } from "next/headers"

// ─── Types ─────────────────────────────────────────────────────────────────

export type ValidateCodeResult =
    | { 
        success: true; 
        electionId: string; 
        name: string; 
        code: string; 
        categoryId?: string; 
        categoryName?: string;
        settings?: {
            authorizeVoters: boolean;
            showSummary: boolean;
            quickElection: boolean;
        }
      }
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
                allowMultipleVotes: boolean
                maxVotesPerUser: number
                showSummary: boolean
                quickElection: boolean
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

export type CheckStatusResult =
    | { success: true; status: string }
    | { error: string }

// ─── Step 1: Validate Election Code ──────────────────────────────────────────

// NOTE: We intentionally do NOT check for PAUSED status here.
// A PAUSED election lets the voter enter the portal, where the client
// will show an in-portal dialog. (See Step 1.5 in vote_logic.md)
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

            if (election.status === "PAUSED") {
                return {
                    success: true,
                    electionId: election.id,
                    name: election.name,
                    code: normalizedCode,
                    settings: election.settings ? {
                        authorizeVoters: election.settings.authorizeVoters,
                        showSummary: election.settings.showSummary,
                        quickElection: election.settings.quickElection,
                    } : undefined,
                }
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
                settings: election.settings ? {
                    authorizeVoters: election.settings.authorizeVoters,
                    showSummary: election.settings.showSummary,
                    quickElection: election.settings.quickElection,
                } : undefined,
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

            if (catElection.status === "PAUSED") {
                return {
                    success: true,
                    electionId: catElection.id,
                    name: catElection.name,
                    code: normalizedCode,
                    categoryId: category.id,
                    categoryName: category.name,
                    settings: catElection.settings ? {
                        authorizeVoters: catElection.settings.authorizeVoters,
                        showSummary: catElection.settings.showSummary,
                        quickElection: catElection.settings.quickElection,
                    } : undefined,
                }
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
                settings: catElection.settings ? {
                    authorizeVoters: catElection.settings.authorizeVoters,
                    showSummary: catElection.settings.showSummary,
                    quickElection: catElection.settings.quickElection,
                } : undefined,
            }
        }

        // Step 1.1 – No match found
        return { error: "Invalid access code. Please check your code and try again." }
    } catch (error) {
        console.error("[VALIDATE_ELECTION_CODE]", error)
        return { error: "Something went wrong. Please try again." }
    }
}

// ─── Live Status Check (for Paused Dialog retry) ─────────────────────────────

export async function checkElectionStatusAction(electionId: string): Promise<CheckStatusResult> {
    try {
        const election = await db.election.findUnique({
            where: { id: electionId },
            select: { status: true },
        })
        if (!election) return { error: "Election not found." }
        return { success: true, status: election.status }
    } catch (error) {
        console.error("[CHECK_ELECTION_STATUS]", error)
        return { error: "Failed to check election status." }
    }
}

// ─── Step 2: Verify Voter ID (stub — full logic to be added) ─────────────────

export async function verifyVoterUniqueIdAction(
    electionId: string,
    uniqueId: string,
    categoryId?: string
): Promise<VerifyVoterResult> {
    try {
        const election = await db.election.findUnique({
            where: { id: electionId },
            include: { settings: true },
        })

        if (!election) {
            return { error: "Election not found." }
        }

        if (election.status === "PAUSED") {
            return { error: "Election is paused.", status: "PAUSED" }
        }

        const voter = await db.voter.findUnique({
            where: {
                electionId_uniqueId: {
                    electionId,
                    uniqueId,
                }
            }
        })

        if (!voter) {
            return { error: "Invalid Voter ID. Please check your ID and try again." }
        }

        // Enforce Category Assignments (Rule A and B)
        if (voter.categoryId) {
            // Voter is assigned to a specific category. They MUST use that category's access code.
            if (voter.categoryId !== categoryId) {
                return { error: "You are assigned to a specific category. Please use your assigned category code to access your ballot." }
            }
        }

        // allowMultipleVotes: if false, voter can only ever cast 1 ballot regardless of maxVotesPerUser
        const allowMultipleVotes = election.settings?.allowMultipleVotes ?? false
        const maxVotes = allowMultipleVotes ? (election.settings?.maxVotesPerUser ?? 1) : 1
        if (voter.ballotCount >= maxVotes) {
            return { error: "You have already cast your ballot for this election." }
        }

        // Fetch the ballot structure — filter roles by category if a categoryId is provided.
        // Step 3.4: Category-scoped role filtering (see vote_logic.md)
        const ballotElection = await db.election.findUnique({
            where: { id: electionId },
            select: {
                id: true,
                name: true,
                settings: {
                    select: {
                        showCandidateProfiles: true,
                        showCandidateSymbols: true,
                        shuffleCandidates: true,
                        allowNota: true,
                        allowMultipleVotes: true,
                        maxVotesPerUser: true,
                        showSummary: true,
                        quickElection: true,
                    },
                },
                roles: {
                    // If categoryId is provided, only return roles linked to that category.
                    // If no categoryId (general election code), return all roles.
                    ...(categoryId
                        ? { where: { categories: { some: { id: categoryId } } } }
                        : {}),
                    orderBy: { order: "asc" },
                    select: {
                        id: true,
                        name: true,
                        order: true,
                        candidates: {
                            where: { deletedAt: null },
                            select: {
                                id: true,
                                name: true,
                                profileImage: true,
                                symbolImage: true,
                            },
                        },
                    },
                },
            },
        })

        if (!ballotElection || !ballotElection.settings) {
            return { error: "Failed to load ballot structure." }
        }

        return {
            success: true,
            voter: {
                id: voter.id,
                uniqueId: voter.uniqueId,
                name: voter.name,
                image: voter.image,
                additionalDetails: voter.additionalDetails,
                ballotsCount: voter.ballotCount,
                maxVotes,
            },
            // Pass the effective maxVotes (already capped by allowMultipleVotes) into the ballot settings
            // so the UI can display remaining votes correctly
            ballot: {
                ...ballotElection,
                settings: {
                    ...ballotElection.settings!,
                    maxVotesPerUser: maxVotes,
                }
            },
        }
    } catch (error) {
        console.error("[VERIFY_VOTER]", error)
        return { error: "An unexpected error occurred during verification." }
    }
}

export async function startAnonymousSessionAction(
    electionId: string,
    categoryId?: string
): Promise<VerifyVoterResult> {
    try {
        const election = await db.election.findUnique({
            where: { id: electionId },
            include: { settings: true },
        })

        if (!election) {
            return { error: "Election not found." }
        }

        if (election.status === "PAUSED") {
            return { error: "Election is paused.", status: "PAUSED" }
        }

        if (election.settings?.authorizeVoters) {
            return { error: "This election requires voter authorization." }
        }

        // Fetch the ballot structure
        const ballotElection = await db.election.findUnique({
            where: { id: electionId },
            select: {
                id: true,
                name: true,
                settings: {
                    select: {
                        showCandidateProfiles: true,
                        showCandidateSymbols: true,
                        shuffleCandidates: true,
                        allowNota: true,
                        allowMultipleVotes: true,
                        maxVotesPerUser: true,
                        showSummary: true,
                        quickElection: true,
                    },
                },
                roles: {
                    ...(categoryId
                        ? { where: { categories: { some: { id: categoryId } } } }
                        : {}),
                    orderBy: { order: "asc" },
                    select: {
                        id: true,
                        name: true,
                        order: true,
                        candidates: {
                            where: { deletedAt: null },
                            select: {
                                id: true,
                                name: true,
                                profileImage: true,
                                symbolImage: true,
                            },
                        },
                    },
                },
            },
        })

        if (!ballotElection || !ballotElection.settings) {
            return { error: "Failed to load ballot structure." }
        }

        return {
            success: true,
            voter: {
                id: "anonymous",
                uniqueId: "anonymous",
                name: "Anonymous Voter",
                image: null,
                additionalDetails: null,
                ballotsCount: 0,
                maxVotes: 1,
            },
            ballot: {
                ...ballotElection,
                settings: {
                    ...ballotElection.settings!,
                    maxVotesPerUser: 1,
                }
            },
        }
    } catch (error) {
        console.error("[START_ANONYMOUS_SESSION]", error)
        return { error: "An unexpected error occurred while starting the session." }
    }
}

// ─── Step 3: Submit Ballot (stub — full logic to be added) ───────────────────

export async function submitBallotAction(
    electionId: string,
    voterId: string | null,
    votes: Record<string, string>,
    categoryId?: string
): Promise<SubmitBallotResult> {
    try {
        const election = await db.election.findUnique({
            where: { id: electionId },
            include: { settings: true },
        })

        if (!election) {
            return { error: "Election not found." }
        }

        if (election.status === "PAUSED") {
            return { error: "Election is paused.", status: "PAUSED" }
        }

        if (election.status !== "ACTIVE") {
            return { error: "Election is not active." }
        }

        const maxVotes = election.settings?.maxVotesPerUser || 1

        // If voterId is "anonymous", treat it as null
        const effectiveVoterId = voterId === "anonymous" ? null : voterId

        // Use a transaction to ensure ballot submission and voter count increment are atomic
        return await db.$transaction(async (tx) => {
            if (effectiveVoterId) {
                // Check voter status inside transaction for authenticated voters
                const voter = await tx.voter.findUnique({
                    where: { id: effectiveVoterId },
                })

                if (!voter) {
                    return { error: "Voter not found." }
                }

                if (voter.ballotCount >= maxVotes) {
                    return { error: "Maximum number of ballots already cast." }
                }
            }

            const reqHeaders = await headers()
            const ipAddress = reqHeaders.get("x-forwarded-for")?.split(",")[0] || reqHeaders.get("x-real-ip") || ""
            const userAgent = reqHeaders.get("user-agent") || ""

            // Create the ballot, attaching categoryId to track where they voted
            const ballot = await tx.ballot.create({
                data: {
                    electionId,
                    voterId: effectiveVoterId,
                    categoryId,
                    submissionKey: crypto.randomUUID(), // Generate a unique submission key
                    isAnonymous: !effectiveVoterId,
                    ipAddress,
                    userAgent,
                },
            })

            // Prepare vote records
            const voteData = Object.entries(votes).map(([roleId, candidateId]) => {
                // If candidateId is "NOTA", we leave candidateId as null (as per typical NOTA design)
                // Assuming "NOTA" is handled by leaving candidateId null in the Vote table.
                const isNota = candidateId === "NOTA"

                return {
                    ballotId: ballot.id,
                    electionRoleId: roleId,
                    candidateId: isNota ? null : candidateId,
                }
            })

            // Insert votes
            if (voteData.length > 0) {
                await tx.vote.createMany({
                    data: voteData,
                })
            }

            // Increment ballot count ONLY if it's an authenticated voter
            if (effectiveVoterId) {
                await tx.voter.update({
                    where: { id: effectiveVoterId },
                    data: {
                        ballotCount: { increment: 1 },
                        lastVotedAt: new Date(),
                    },
                })
            }

            return { success: true }
        })
    } catch (error) {
        console.error("[SUBMIT_BALLOT]", error)
        return { error: "An unexpected error occurred while submitting your ballot." }
    }
}
