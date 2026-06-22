import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { VoterSessionPortal } from "./_components/VoterSessionPortal"
import { DeviceGuard } from "../_components/DeviceGuard"

export const dynamic = "force-dynamic"

export default async function VotePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    // Check if an admin is logged in. They should not be able to access the voting portal.
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (session) {
        redirect("/auth/vote")
    }

    const { id } = await params

    // Try to resolve as an Election ID first
    const election = await db.election.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            status: true,
            startTime: true,
            endTime: true,
            organization: {
                select: {
                    name: true,
                    logo: true,
                    settings: {
                        select: { allowCustomBranding: true }
                    }
                },
            },
            settings: {
                select: {
                    allowOnlineVoting: true,
                    authorizeVoters: true,
                    quickElection: true,
                },
            },
        },
    })

    // If not found by election ID, try as a Category ID
    let resolvedElection = election
    let resolvedCategory: { id: string; name: string } | null = null

    if (!resolvedElection) {
        const category = await db.electionCategory.findUnique({
            where: { id },
            include: {
                election: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                        startTime: true,
                        endTime: true,
                        organization: {
                            select: {
                                name: true,
                                logo: true,
                                settings: {
                                    select: { allowCustomBranding: true }
                                }
                            },
                        },
                        settings: {
                            select: {
                                allowOnlineVoting: true,
                                authorizeVoters: true,
                                quickElection: true,
                            },
                        },
                    },
                },
            },
        })

        if (category) {
            resolvedElection = category.election
            resolvedCategory = { id: category.id, name: category.name }
        }
    }

    // Guard: election must exist and have online voting enabled.
    // NOTE: PAUSED elections are allowed through — the client portal handles the paused state.
    if (
        !resolvedElection ||
        !resolvedElection.settings?.allowOnlineVoting ||
        (resolvedElection.status !== "ACTIVE" && resolvedElection.status !== "PAUSED")
    ) {
        return notFound()
    }

    const isPaused = resolvedElection.status === "PAUSED"

    return (
        <DeviceGuard>
            <VoterSessionPortal
                election={resolvedElection}
                category={resolvedCategory}
                isPaused={isPaused}
            />
        </DeviceGuard>
    )
}
