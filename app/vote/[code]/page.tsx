import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { VoterSessionPortal } from "./_components/VoterSessionPortal"

export default async function VotePage({
    params,
    searchParams,
}: {
    params: Promise<{ code: string }>
    searchParams: Promise<{ categoryId?: string }>
}) {
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
                },
            },
            settings: {
                select: {
                    allowOnlineVoting: true,
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
                            },
                        },
                        settings: {
                            select: {
                                allowOnlineVoting: true,
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

    // Guard: election must exist, have online voting enabled, and be ACTIVE
    if (
        !resolvedElection ||
        !resolvedElection.settings?.allowOnlineVoting ||
        resolvedElection.status !== "ACTIVE"
    ) {
        return notFound()
    }

    return (
        <VoterSessionPortal
            election={resolvedElection}
            category={resolvedCategory}
            accessCode={normalizedCode}
        />
    )
}
