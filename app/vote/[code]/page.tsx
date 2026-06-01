import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { VoterSessionPortal } from "./_components/VoterSessionPortal"

export default async function VotePage({
    params,
    searchParams,
}: {
    params: Promise<{ code: string }>
    searchParams: Promise<{ categoryId?: string }>
}) {
    // Check if an admin is logged in. They should not be able to access the voting portal.
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (session) {
        redirect("/auth/vote")
    }

    const { code } = await params
    const { categoryId } = await searchParams

    const normalizedCode = code.toUpperCase()

    // Try to resolve as an Election code first
    const election = await db.election.findUnique({
        where: { code: normalizedCode },
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
                },
            },
        },
    })

    // If not found by election code, try category code
    let resolvedElection = election
    let resolvedCategory: { id: string; name: string } | null = null

    if (!resolvedElection) {
        const category = await db.electionCategory.findFirst({
            where: { code: normalizedCode },
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
    } else if (categoryId) {
        // Election code was used, but a categoryId was passed via query param
        const cat = await db.electionCategory.findFirst({
            where: { id: categoryId, electionId: resolvedElection.id },
            select: { id: true, name: true },
        })
        if (cat) resolvedCategory = cat
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
        <VoterSessionPortal
            election={resolvedElection}
            category={resolvedCategory}
            accessCode={normalizedCode}
            isPaused={isPaused}
        />
    )
}
