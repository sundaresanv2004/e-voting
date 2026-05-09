"use server"

import { db } from "@/lib/db"
import { format } from "date-fns"
import { VoterIdSchema } from "@/lib/schemas/vote"
import { syncElectionStatus } from "@/lib/elections/status-sync"
import { 
    enforceRateLimit, 
    getClientIp, 
    formatRetryMessage, 
    RateLimitError 
} from "@/lib/rate-limit"

export async function verifyVoterUniqueIdAction(electionId: string, uniqueId: string) {
    try {
        const voter = await db.voter.findFirst({
            where: {
                electionId,
                uniqueId: uniqueId.trim()
            },
            include: {
                ballots: true,
                election: {
                    select: {
                        id: true,
                        status: true,
                        settings: true
                    }
                }
            }
        })

        const ip = await getClientIp()
        await enforceRateLimit({
            action: "voter-verify",
            identifiers: [`ip:${ip}`, `election:${electionId}`],
            limit: 10,
            windowMs: 60 * 60 * 1000,
        })

        if (!voter) {
            return { error: "We couldn't find this Voter ID. Please double-check and try again." }
        }

        // --- Current Status Check ---
        if (voter.election.status !== "ACTIVE") {
            if (voter.election.status === "PAUSED") {
                return { 
                    error: "This election is currently paused by the administrator. Please wait and try again later.",
                    status: "PAUSED"
                }
            }
            return { error: "This election is not currently active. Please contact your organization." }
        }
        // -------------------------

        const maxVotes = voter.election.settings?.allowMultipleVotes 
            ? (voter.election.settings.maxVotesPerUser || 1) 
            : 1;

        if (voter.ballots.length >= maxVotes) {
            return { error: "It looks like a vote has already been cast using this ID." }
        }

        return { 
            success: true, 
            voter: {
                id: voter.id,
                uniqueId: voter.uniqueId,
                name: voter.name,
                image: voter.image,
                additionalDetails: voter.additionalDetails,
                ballotsCount: voter.ballots.length,
                maxVotes: maxVotes
            }
        }
    } catch (error) {
        if (error instanceof RateLimitError) {
            return { error: formatRetryMessage(error.retryAfterSeconds) }
        }
        console.error("Voter verification error:", error)
        return { error: "Something went wrong. Please try again." }
    }
}

export async function validateElectionCodeAction(code: string) {
    if (!code) {
        return { error: "Election code is required" }
    }

    try {
        const election = await db.election.findFirst({
            where: {
                code: code.toUpperCase(),
            },
            include: {
                settings: true
            }
        })

        const ip = await getClientIp()
        await enforceRateLimit({
            action: "election-code-verify",
            identifiers: [`ip:${ip}`],
            limit: 20,
            windowMs: 15 * 60 * 1000,
        })

        if (!election) {
            return { error: "Election not found. Please check your code and try again." }
        }

        const syncedElection = await syncElectionStatus(election.id, {
            organizationId: election.organizationId,
            reason: "Online vote code validation",
        })
        if (syncedElection) {
            election.status = syncedElection.status
        }

        // 1. Check if online voting is allowed
        if (!election.settings?.allowOnlineVoting) {
            return { error: "Online voting is disabled for this election." }
        }

        // 2. Check lifecycle status
        if (election.status !== "ACTIVE") {
            if (election.status === "UPCOMING") {
                const formattedDate = election.startTime ? format(election.startTime, "dd/MM/yyyy, hh:mm a") : "its scheduled time"
                return { error: `This election starts on ${formattedDate}.` }
            }
            if (election.status === "COMPLETED") {
                return { error: "This election has ended." }
            }
            if (election.status === "CANCELLED") {
                return { error: "This election has been cancelled." }
            }
            if (election.status === "PAUSED") {
                return { error: "This election is currently paused. Please try again later." }
            }
            return { error: "This election is not active." }
        }

        return { success: true, electionId: election.id, name: election.name }
    } catch (error) {
        if (error instanceof RateLimitError) {
            return { error: formatRetryMessage(error.retryAfterSeconds) }
        }
        console.error("Validation error:", error)
        return { error: "Something went wrong. Please try again." }
    }
}

export async function submitBallotAction(electionId: string, voterId: string, votes: Record<string, string>) {
    try {
        const voter = await db.voter.findUnique({
            where: { id: voterId },
            include: {
                election: { include: { organization: true, settings: true } },
                ballots: true
            }
        })

        if (!voter) return { error: "Voter not found. Please try again." }
        
        const maxVotes = voter.election.settings?.allowMultipleVotes 
            ? (voter.election.settings.maxVotesPerUser || 1) 
            : 1;

        if (voter.ballots.length >= maxVotes) return { error: "A vote has already been cast using this ID." }
        if (voter.election.status !== "ACTIVE") {
            if (voter.election.status === "PAUSED") {
                return { error: "This election is currently paused.", status: "PAUSED" }
            }
            return { error: "This election is not active.", status: voter.election.status }
        }

        // Find or create a default "Web Voting Portal" authorized system for this organization
        let webSystem = await db.authorizedSystem.findFirst({
            where: {
                organizationId: voter.election.organizationId,
                name: "Web Voting System"
            }
        })

        if (!webSystem) {
            webSystem = await db.authorizedSystem.create({
                data: {
                    organizationId: voter.election.organizationId,
                    name: "Web Voting System",
                    status: "APPROVED"
                }
            })
        }

        // Prepare the votes creation payload
        const voteEntries = Object.entries(votes).map(([roleId, candidateId]) => ({
            electionRoleId: roleId,
            candidateId: candidateId === "NOTA" ? null : candidateId
        }))

        // Execute ballot creation and vote entries inside a transaction
        await db.$transaction(async (prisma) => {
            const ballot = await prisma.ballot.create({
                data: {
                    electionId: electionId,
                    systemId: webSystem.id,
                    voterId: voterId,
                    votes: {
                        create: voteEntries
                    }
                }
            })
            return ballot
        })

        return { success: true }
    } catch (error: any) {
        console.error("Ballot submission error:", error)
        if (error?.code === 'P2002') {
            return { error: "A vote has already been recorded for this ID." } // Prisma unique constraint handling
        }
        return { error: "Something went wrong while submitting your ballot. Please try again." }
    }
}
