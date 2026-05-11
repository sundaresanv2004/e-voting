"use server"

import { db } from "@/lib/db"
import { format } from "date-fns"
import { AuditStatus, Prisma } from "@prisma/client"
import { syncElectionStatus } from "@/lib/elections/status-sync"
import { 
    enforceRateLimit, 
    getClientIp, 
    formatRetryMessage, 
    RateLimitError 
} from "@/lib/rate-limit"

export async function verifyVoterUniqueIdAction(electionId: string, uniqueId: string) {
    try {
        const ip = await getClientIp()
        await enforceRateLimit({
            action: "voter-verify",
            identifiers: [`ip:${ip}`, `election:${electionId}`],
            limit: 10,
            windowMs: 60 * 60 * 1000,
        })

        const voter = await db.voter.findFirst({
            where: {
                electionId,
                uniqueId: uniqueId.trim()
            },
            include: {
                ballots: true,
                election: {
                    include: {
                        settings: true,
                        roles: {
                            where: {
                                candidates: { some: {} }
                            },
                            orderBy: { order: "asc" },
                            select: {
                                id: true,
                                name: true,
                                order: true,
                                candidates: {
                                    select: {
                                        id: true,
                                        name: true,
                                        profileImage: true,
                                        symbolImage: true,
                                    }
                                }
                            }
                        }
                    },
                }
            }
        })

        if (!voter) {
            return { error: "We couldn't find this Voter ID. Please double-check and try again." }
        }

        if (!voter.election.settings?.allowOnlineVoting || !voter.election.settings?.authorizeVoters) {
            return { error: "Online voter verification is not available for this election." }
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
            },
            ballot: {
                id: voter.election.id,
                name: voter.election.name,
                settings: {
                    showCandidateProfiles: voter.election.settings.showCandidateProfiles,
                    showCandidateSymbols: voter.election.settings.showCandidateSymbols,
                    shuffleCandidates: voter.election.settings.shuffleCandidates,
                    allowNota: voter.election.settings.allowNota,
                },
                roles: voter.election.roles,
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
        if (!electionId || !voterId || !votes || typeof votes !== "object") {
            return { error: "Invalid ballot submission. Please try again." }
        }

        await syncElectionStatus(electionId, {
            reason: "Online ballot submission",
        })

        const ip = await getClientIp()

        await db.$transaction(async (prisma) => {
            const voter = await prisma.voter.findFirst({
                where: {
                    id: voterId,
                    electionId,
                },
                include: {
                    election: {
                        include: {
                            settings: true,
                            roles: {
                                where: {
                                    candidates: { some: {} }
                                },
                                include: {
                                    candidates: true
                                }
                            }
                        }
                    },
                }
            })

            if (!voter) {
                throw new Error("VOTER_NOT_FOUND")
            }

            const { election } = voter
            const settings = election.settings

            if (!settings?.allowOnlineVoting || !settings.authorizeVoters) {
                throw new Error("ONLINE_VOTING_UNAVAILABLE")
            }

            if (election.status !== "ACTIVE") {
                if (election.status === "PAUSED") {
                    throw new Error("ELECTION_PAUSED")
                }
                throw new Error(`ELECTION_NOT_ACTIVE:${election.status}`)
            }

            const roles = [...election.roles].sort((a, b) => a.order - b.order)
            const submittedEntries = Object.entries(votes)
            const submittedRoleIds = new Set(submittedEntries.map(([roleId]) => roleId))

            if (submittedEntries.length !== roles.length || submittedRoleIds.size !== roles.length) {
                throw new Error("INCOMPLETE_BALLOT")
            }

            for (const role of roles) {
                if (!submittedRoleIds.has(role.id)) {
                    throw new Error("INCOMPLETE_BALLOT")
                }
            }

            const voteEntries = roles.map((role) => {
                const candidateId = votes[role.id]

                if (!candidateId) {
                    throw new Error("INCOMPLETE_BALLOT")
                }

                if (candidateId === "NOTA") {
                    if (!settings.allowNota) {
                        throw new Error("INVALID_NOTA_SELECTION")
                    }

                    return {
                        electionRoleId: role.id,
                        candidateId: null,
                    }
                }

                const candidate = role.candidates.find((item) => item.id === candidateId)
                if (!candidate) {
                    throw new Error("INVALID_CANDIDATE_SELECTION")
                }

                return {
                    electionRoleId: role.id,
                    candidateId: candidate.id,
                }
            })

            const maxVotes = settings.allowMultipleVotes
                ? (settings.maxVotesPerUser || 1)
                : 1

            const ballotsCount = await prisma.ballot.count({
                where: {
                    electionId,
                    voterId,
                }
            })

            if (ballotsCount >= maxVotes) {
                throw new Error("VOTE_LIMIT_REACHED")
            }

            const submissionKey = `${electionId}:${voterId}:${ballotsCount + 1}`

            let webSystem = await prisma.authorizedSystem.findFirst({
                where: {
                    organizationId: election.organizationId,
                    name: "Web Voting System"
                }
            })

            if (!webSystem) {
                webSystem = await prisma.authorizedSystem.create({
                    data: {
                        organizationId: election.organizationId,
                        name: "Web Voting System",
                        status: "APPROVED"
                    }
                })
            }

            const ballot = await prisma.ballot.create({
                data: {
                    electionId,
                    systemId: webSystem.id,
                    submissionKey,
                    voterId,
                    votes: {
                        create: voteEntries
                    }
                }
            })

            await prisma.systemAuditLog.create({
                data: {
                    systemId: webSystem.id,
                    electionId,
                    action: "ONLINE_BALLOT_SUBMITTED",
                    status: AuditStatus.SUCCESS,
                    ipAddress: ip,
                    metadata: {
                        mode: "ONLINE",
                        verifiedVoter: true,
                        ballotId: ballot.id,
                        voterId,
                        rolesCount: voteEntries.length,
                    }
                }
            })
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        })

        return { success: true }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : undefined
        const prismaCode = error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined

        if (message === "VOTER_NOT_FOUND") {
            return { error: "Voter not found for this election. Please verify your identity again." }
        }
        if (message === "ONLINE_VOTING_UNAVAILABLE") {
            return { error: "Online verified voting is not available for this election." }
        }
        if (message === "ELECTION_PAUSED") {
            return { error: "This election is currently paused.", status: "PAUSED" }
        }
        if (message?.startsWith("ELECTION_NOT_ACTIVE:")) {
            return { error: "This election is not active.", status: message.split(":")[1] }
        }
        if (message === "INCOMPLETE_BALLOT") {
            return { error: "Please make a valid selection for every role before casting your ballot." }
        }
        if (message === "INVALID_NOTA_SELECTION") {
            return { error: "NOTA is not enabled for this election." }
        }
        if (message === "INVALID_CANDIDATE_SELECTION") {
            return { error: "Your ballot contains an invalid candidate selection. Please refresh and try again." }
        }
        if (message === "VOTE_LIMIT_REACHED") {
            return { error: "A vote has already been cast using this ID." }
        }
        if (prismaCode === "P2034") {
            return { error: "A vote is already being processed for this ID. Please wait a moment and try again." }
        }
        console.error("Ballot submission error:", error)
        if (prismaCode === 'P2002') {
            return { error: "A vote has already been recorded for this ID." } // Prisma unique constraint handling
        }
        return { error: "Something went wrong while submitting your ballot. Please try again." }
    }
}
