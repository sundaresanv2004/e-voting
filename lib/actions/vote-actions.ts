"use server"

import { db } from "@/lib/db"
import {
    assertElectionAcceptsVotes,
    assertVoteSelectionShape,
    reserveVoterBallotSlot,
} from "@/lib/voting/integrity"
import { createVoterSession, getVoterSession, clearVoterSession } from "@/lib/voting/session"
import { format } from "date-fns"
import { headers } from "next/headers"
import { logAdminAction } from "@/lib/auth/audit"
import { AuditEntityType, AuditStatus } from "@prisma/client"

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

export interface BallotData {
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
        ballot: BallotData
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

// ─── Step 1.5: Prefetch Ballot Data for Caching ──────────────────────────────

export type PrefetchBallotResult = 
    | { success: true; ballot: BallotData; updatedAt: Date }
    | { error: string }

export async function prefetchBallotDataAction(
    electionId: string,
    categoryId?: string
): Promise<PrefetchBallotResult> {
    try {
        const election = await db.election.findUnique({
            where: { id: electionId },
            include: { settings: true },
        })

        if (!election || !election.settings) {
            return { error: "Election not found." }
        }

        const maxVotes = election.settings.allowMultipleVotes ? (election.settings.maxVotesPerUser ?? 1) : 1

        const ballotElection = await db.election.findUnique({
            where: { id: electionId },
            select: {
                id: true,
                name: true,
                updatedAt: true,
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
            updatedAt: ballotElection.updatedAt,
            ballot: {
                id: ballotElection.id,
                name: ballotElection.name,
                settings: {
                    ...ballotElection.settings,
                    maxVotesPerUser: maxVotes,
                },
                roles: ballotElection.roles,
            },
        }
    } catch (error) {
        console.error("[PREFETCH_BALLOT_DATA]", error)
        return { error: "Failed to prefetch ballot data." }
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
            await logAdminAction({
                action: "VOTER_SESSION_STARTED",
                entityType: AuditEntityType.VOTER,
                organizationId: election.organizationId,
                status: AuditStatus.FAILURE,
                description: "Voter session start failed: Election is paused.",
                metadata: { electionId, uniqueId, categoryId }
            })
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
            await logAdminAction({
                action: "VOTER_SESSION_STARTED",
                entityType: AuditEntityType.VOTER,
                organizationId: election.organizationId,
                status: AuditStatus.FAILURE,
                description: "Voter session start failed: Invalid Voter ID entered.",
                metadata: { electionId, uniqueId, categoryId }
            })
            return { error: "Invalid Voter ID. Please check your ID and try again." }
        }

        // Enforce Category Assignments (Rule A and B)
        if (voter.categoryId) {
            // Voter is assigned to a specific category. They MUST use that category's access code.
            if (voter.categoryId !== categoryId) {
                await logAdminAction({
                    action: "VOTER_SESSION_STARTED",
                    entityType: AuditEntityType.VOTER,
                    entityId: voter.id,
                    organizationId: election.organizationId,
                    status: AuditStatus.FAILURE,
                    description: "Voter session start failed: Voter category mismatch.",
                    metadata: { electionId, voterId: voter.id, categoryId }
                })
                return { error: "You are assigned to a specific category. Please use your assigned category code to access your ballot." }
            }
        }

        // allowMultipleVotes: if false, voter can only ever cast 1 ballot regardless of maxVotesPerUser
        const allowMultipleVotes = election.settings?.allowMultipleVotes ?? false
        const maxVotes = allowMultipleVotes ? (election.settings?.maxVotesPerUser ?? 1) : 1
        if (voter.ballotCount >= maxVotes) {
            await logAdminAction({
                action: "VOTER_SESSION_STARTED",
                entityType: AuditEntityType.VOTER,
                entityId: voter.id,
                organizationId: election.organizationId,
                status: AuditStatus.FAILURE,
                description: "Voter session start failed: Voter has already voted.",
                metadata: { electionId, voterId: voter.id, categoryId, ballotCount: voter.ballotCount, maxVotes }
            })
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
            await logAdminAction({
                action: "VOTER_SESSION_STARTED",
                entityType: AuditEntityType.VOTER,
                entityId: voter.id,
                organizationId: election.organizationId,
                status: AuditStatus.FAILURE,
                description: "Voter session start failed: Failed to load ballot structure.",
                metadata: { electionId, voterId: voter.id, categoryId }
            })
            return { error: "Failed to load ballot structure." }
        }

        await logAdminAction({
            action: "VOTER_SESSION_STARTED",
            entityType: AuditEntityType.VOTER,
            entityId: voter.id,
            organizationId: election.organizationId,
            status: AuditStatus.SUCCESS,
            description: `Voter "${voter.name}" verified unique ID and started session.`,
            metadata: { electionId, voterId: voter.id, categoryId }
        })

        await createVoterSession({ voterId: voter.id, electionId: election.id, isAnonymous: false })

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
        let orgId: string | null = null
        try {
            const el = await db.election.findUnique({ where: { id: electionId }, select: { organizationId: true } })
            orgId = el?.organizationId ?? null
        } catch {}
        await logAdminAction({
            action: "VOTER_SESSION_STARTED",
            entityType: AuditEntityType.VOTER,
            organizationId: orgId,
            status: AuditStatus.FAILURE,
            description: `Voter session start failed: ${error instanceof Error ? error.message : String(error)}`,
            metadata: { electionId, uniqueId, categoryId }
        })
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
            await logAdminAction({
                action: "ANONYMOUS_VOTER_SESSION_STARTED",
                entityType: AuditEntityType.VOTER,
                organizationId: election.organizationId,
                status: AuditStatus.FAILURE,
                description: "Anonymous voter session start failed: Election is paused.",
                metadata: { electionId, categoryId }
            })
            return { error: "Election is paused.", status: "PAUSED" }
        }

        if (election.settings?.authorizeVoters) {
            await logAdminAction({
                action: "ANONYMOUS_VOTER_SESSION_STARTED",
                entityType: AuditEntityType.VOTER,
                organizationId: election.organizationId,
                status: AuditStatus.FAILURE,
                description: "Anonymous voter session start failed: Election requires voter authorization.",
                metadata: { electionId, categoryId }
            })
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
            await logAdminAction({
                action: "ANONYMOUS_VOTER_SESSION_STARTED",
                entityType: AuditEntityType.VOTER,
                organizationId: election.organizationId,
                status: AuditStatus.FAILURE,
                description: "Anonymous voter session start failed: Failed to load ballot structure.",
                metadata: { electionId, categoryId }
            })
            return { error: "Failed to load ballot structure." }
        }

        await logAdminAction({
            action: "ANONYMOUS_VOTER_SESSION_STARTED",
            entityType: AuditEntityType.VOTER,
            organizationId: election.organizationId,
            status: AuditStatus.SUCCESS,
            description: "Anonymous voter started session.",
            metadata: { electionId, categoryId }
        })

        const anonymousVoterId = crypto.randomUUID();
        await createVoterSession({ voterId: anonymousVoterId, electionId: election.id, isAnonymous: true })

        return {
            success: true,
            voter: {
                id: anonymousVoterId,
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
        let orgId: string | null = null
        try {
            const el = await db.election.findUnique({ where: { id: electionId }, select: { organizationId: true } })
            orgId = el?.organizationId ?? null
        } catch {}
        await logAdminAction({
            action: "ANONYMOUS_VOTER_SESSION_STARTED",
            entityType: AuditEntityType.VOTER,
            organizationId: orgId,
            status: AuditStatus.FAILURE,
            description: `Anonymous voter session start failed: ${error instanceof Error ? error.message : String(error)}`,
            metadata: { electionId, categoryId }
        })
        return { error: "An unexpected error occurred while starting the session." }
    }
}

// ─── Step 3: Submit Ballot (stub — full logic to be added) ───────────────────

export async function submitBallotAction(
    electionId: string,
    votes: Record<string, string>,
    categoryId?: string
): Promise<SubmitBallotResult> {
    try {
        const session = await getVoterSession()
        
        if (!session || session.electionId !== electionId) {
            return { error: "Invalid or expired voting session. Please refresh and try again." }
        }

        const effectiveVoterId = session.isAnonymous ? null : session.voterId
        const sessionVoterId = session.voterId

        const reqHeaders = await headers()
        const ipAddress = reqHeaders.get("x-real-ip") || reqHeaders.get("x-forwarded-for")?.split(",")[0] || ""
        const userAgent = reqHeaders.get("user-agent") || ""

        return await db.$transaction(async (tx) => {
            const election = await assertElectionAcceptsVotes(tx, electionId)
            const settings = election.settings
            const allowMultipleVotes = settings?.allowMultipleVotes ?? false
            const maxVotes = effectiveVoterId
                ? allowMultipleVotes
                    ? settings?.maxVotesPerUser ?? 1
                    : 1
                : 1

            if (!effectiveVoterId && settings?.authorizeVoters) {
                throw new Error("This election requires voter authorization.")
            }

            let resolvedCategoryId: string | null = null
            if (categoryId) {
                const category = await tx.electionCategory.findFirst({
                    where: { id: categoryId, electionId },
                    select: { id: true },
                })
                if (!category) {
                    throw new Error("Invalid voting category.")
                }
                resolvedCategoryId = category.id
            }

            if (effectiveVoterId) {
                const voter = await tx.voter.findUnique({
                    where: { id: effectiveVoterId },
                    select: { id: true, electionId: true, categoryId: true },
                })

                if (!voter || voter.electionId !== electionId) {
                    throw new Error("Voter not found for this election.")
                }

                if (voter.categoryId && voter.categoryId !== resolvedCategoryId) {
                    throw new Error("Voter must use their assigned category.")
                }
            }

            const roles = await tx.electionRole.findMany({
                where: {
                    electionId,
                    ...(resolvedCategoryId
                        ? { categories: { some: { id: resolvedCategoryId } } }
                        : {}),
                },
                select: {
                    id: true,
                    candidates: {
                        where: { deletedAt: null },
                        select: { id: true },
                    },
                },
                orderBy: { order: "asc" },
            })

            if (roles.length === 0) {
                throw new Error("This ballot has no roles configured.")
            }

            const requiredRoleIds = roles.map((role) => role.id)
            const selectedRoleIds = Object.keys(votes)
            assertVoteSelectionShape({ selectedRoleIds, requiredRoleIds })

            if (selectedRoleIds.length !== requiredRoleIds.length) {
                throw new Error("Unexpected vote selections are not allowed.")
            }

            const roleCandidateIds = new Map(
                roles.map((role) => [role.id, new Set(role.candidates.map((candidate) => candidate.id))])
            )

            const voteData = Object.entries(votes).map(([roleId, candidateId]) => {
                const validCandidates = roleCandidateIds.get(roleId)
                if (!validCandidates) {
                    throw new Error("Invalid election role selected.")
                }

                const isNota = candidateId === "NOTA"
                if (isNota) {
                    if (!settings?.allowNota) {
                        throw new Error("NOTA is not enabled for this election.")
                    }
                    return {
                        electionRoleId: roleId,
                        candidateId: null,
                    }
                }

                if (!validCandidates.has(candidateId)) {
                    throw new Error("Invalid candidate selected.")
                }

                return {
                    electionRoleId: roleId,
                    candidateId,
                }
            })

            if (effectiveVoterId) {
                await reserveVoterBallotSlot({
                    tx,
                    electionId,
                    voterId: effectiveVoterId,
                    maxVotesPerUser: maxVotes,
                })
            }


            const ballot = await tx.ballot.create({
                data: {
                    electionId,
                    voterId: effectiveVoterId,
                    categoryId: resolvedCategoryId,
                    submissionKey: crypto.randomUUID(), // Generate a unique submission key
                    isAnonymous: session.isAnonymous,
                    ipAddress,
                    userAgent,
                },
            })

            await tx.vote.createMany({
                data: voteData.map((vote) => ({
                    ballotId: ballot.id,
                    electionRoleId: vote.electionRoleId,
                    candidateId: vote.candidateId,
                })),
            })

            await logAdminAction({
                action: "BALLOT_SUBMITTED",
                entityType: AuditEntityType.BALLOT,
                entityId: ballot.id,
                organizationId: election.organizationId,
                status: AuditStatus.SUCCESS,
                description: effectiveVoterId 
                    ? `Ballot cast successfully by voter ID: ${effectiveVoterId}`
                    : "Anonymous ballot cast successfully",
                tx,
                metadata: { electionId, voterId: effectiveVoterId, sessionVoterId, categoryId, ballotId: ballot.id }
            })

            return { success: true }
        })
    } catch (error: any) {
        console.error("[SUBMIT_BALLOT]", error)
        try {
            const election = await db.election.findUnique({
                where: { id: electionId },
                select: { organizationId: true }
            })
            await logAdminAction({
                action: "BALLOT_SUBMITTED",
                entityType: AuditEntityType.BALLOT,
                organizationId: election?.organizationId,
                status: AuditStatus.FAILURE,
                description: `Ballot submission failed: ${error?.message || String(error)}`,
                metadata: { electionId, categoryId }
            })
        } catch {}
        return { error: "An unexpected error occurred while submitting your ballot." }
    }
}
