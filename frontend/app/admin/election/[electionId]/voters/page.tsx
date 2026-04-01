export default async function VotersPage({
    params
}: {
    params: Promise<{ electionId: string }>
}) {
    const electionId = (await params).electionId
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Voters</h1>
            <p className="text-muted-foreground mb-4">Election Context: {electionId}</p>
            <p>Manage voters and eligibility for this election.</p>
        </div>
    )
}
