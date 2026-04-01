export default async function ResultsPage({
    params
}: {
    params: Promise<{ electionId: string }>
}) {
    const electionId = (await params).electionId
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Election Results</h1>
            <p className="text-muted-foreground mb-4">Election Context: {electionId}</p>
            <p>View and analyze the results of this election.</p>
        </div>
    )
}
