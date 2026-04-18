"use server"

import { db } from "@/lib/db"
import { format } from "date-fns"
import { VoterIdSchema } from "@/lib/schemas/vote"

export async function verifyVoterUniqueIdAction(electionId: string, uniqueId: string) {
    try {
        const voter = await db.voter.findUnique({
            where: {
                electionId_uniqueId: {
                    electionId,
                    uniqueId: uniqueId.trim()
                }
            },
            include: {
                ballot: true,
                election: {
                    select: {
                        status: true
                    }
                }
            }
        })

        if (!voter) {
            return { error: "Validation failed: The provided Unique ID was not found in the authorized voter roll for this election." }
        }

        // --- Live Status Check ---
        if (voter.election.status !== "ACTIVE") {
            if (voter.election.status === "PAUSED") {
                return { error: "Access Suspended: This election has been temporarily paused by the administrator. Identification and voting are currently unavailable." }
            }
            return { error: "Access Denied: This election is currently not in an active state. Please contact your organization for details." }
        }
        // -------------------------

        if (voter.ballot) {
            return { error: "Access Denied: Our records show that a ballot has already been submitted for this Unique ID. Each voter is restricted to a single submission." }
        }

        return { 
            success: true, 
            voter: {
                id: voter.id,
                uniqueId: voter.uniqueId,
                name: voter.name,
                image: voter.image,
                additionalDetails: voter.additionalDetails
            }
        }
    } catch (error) {
        console.error("Voter verification error:", error)
        return { error: "An error occurred during identification. Please try again." }
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

        if (!election) {
            return { error: "The election session you're looking for was not found. Please verify your code and try again." }
        }

        // --- Lazy Status Sync ---
        const now = new Date()
        let calculatedStatus = election.status
        
        if (election.startTime && now < election.startTime) {
            calculatedStatus = "UPCOMING"
        } else if (election.endTime && now > election.endTime) {
            calculatedStatus = "COMPLETED"
        } else if (election.startTime && election.endTime && now >= election.startTime && now <= election.endTime) {
            // Only auto-activate if it was UPCOMING or it's currently PAUSED but technically should be ACTIVE
            // Wait, if it's PAUSED, we usually leave it PAUSED.
            if (election.status === "UPCOMING") {
                calculatedStatus = "ACTIVE"
            }
        }

        // If stale, update DB
        if (calculatedStatus !== election.status) {
            await db.election.update({
                where: { id: election.id },
                data: { status: calculatedStatus }
            })
            election.status = calculatedStatus
        }
        // -------------------------

        // 1. Check if online voting is allowed
        if (!election.settings?.allowOnlineVoting) {
            return { error: "Web-based voting is currently disabled for this election. If you are a voter, please contact your administrator." }
        }

        // 2. Check lifecycle status
        if (election.status !== "ACTIVE") {
            if (election.status === "UPCOMING") {
                const formattedDate = election.startTime ? format(election.startTime, "dd/MM/yyyy, hh:mm a") : "its scheduled time"
                return { error: `This election is scheduled to begin on ${formattedDate}. Please return then to cast your vote.` }
            }
            if (election.status === "COMPLETED") {
                return { error: "This election has already been concluded. Results will be published by the administrator." }
            }
            if (election.status === "CANCELLED") {
                return { error: "This election has been cancelled by the organization." }
            }
            if (election.status === "PAUSED") {
                return { error: "This election is currently paused by the administrator. Please try again later." }
            }
            return { error: "This election is currently not available for voting." }
        }

        return { success: true, electionId: election.id, name: election.name }
    } catch (error) {
        console.error("Validation error:", error)
        return { error: "An unexpected error occurred. Please try again later." }
    }
}
