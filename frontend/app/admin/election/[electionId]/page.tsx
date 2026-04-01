export default async function ElectionDashboardPage({
    params
}: {
    params: Promise<{ electionId: string }>
}) {
    const electionId = (await params).electionId
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Election Dashboard</h1>
            <p className="text-muted-foreground mb-4">You are viewing Election ID: {electionId}</p>
            <p>Overview of the current active election.</p>
        </div>
    )
}
