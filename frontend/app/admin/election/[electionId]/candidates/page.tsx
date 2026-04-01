export default async function CandidatesPage({
    params
}: {
    params: Promise<{ electionId: string }>
}) {
    const electionId = (await params).electionId
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Candidates</h1>
            <p className="text-muted-foreground mb-4">Election Context: {electionId}</p>
            <p>Manage candidates for this election.</p>
        </div>
    )
}
