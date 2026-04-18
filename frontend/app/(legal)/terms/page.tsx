import { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
    title: "Terms of Service | E-Voting",
    description: "The rules and agreements for using the E-Voting platform.",
}

export default function TermsPage() {
    return (
        <>
            <Card className="mb-4 sm:mb-10 bg-muted/50 border-muted">
                <CardContent>
                    <p className="text-sm font-medium text-foreground m-0">
                        <strong>Agreement:</strong> By accessing E-Voting, you agree to abide by these Terms. Our platform ensures secure, fair, and transparent elections for all users.
                    </p>
                </CardContent>
            </Card>

            <section id="acceptance">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">1. Acceptance of Terms</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            These Terms of Service (&#34;Terms&#34;) constitute a binding legal agreement between you and E-Voting. By creating an account, voting, or organizing an election, you accept these Terms in full.
                        </p>
                    </CardContent>
                </Card>
            </section>

            <section id="eligibility">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">2. Eligibility & Accounts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            <strong>Authorized Use:</strong> You may only access elections for which you are an authorized voter or administrator.
                        </p>
                        <p className="mt-4">
                            <strong>Account Security:</strong> You are responsible for safeguarding your credentials. Any vote cast from your authenticated account is deemed to be cast by you. Sharing account access is strictly prohibited to maintain election integrity.
                        </p>
                    </CardContent>
                </Card>
            </section>

            <section id="voting-conduct">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">3. Voting Conduct</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            You agree NOT to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-4">
                            <li>Attempt to vote more than once per election (unless authorized by specific voting rules like ranked choice).</li>
                            <li>Coerce, intimidate, or bribe other voters.</li>
                            <li>Interfere with the voting mechanism or attempt to reverse-engineer vote anonymity.</li>
                            <li>Impersonate another voter or administrator.</li>
                        </ul>
                    </CardContent>
                </Card>
            </section>

            <section id="election-integrity">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">4. Election Integrity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            <strong>Platform Neutrality:</strong> E-Voting acts as a neutral platform provider. We do not influence election outcomes. The content of ballots and the list of eligible voters are the sole responsibility of the Organization Administrator.
                        </p>
                        <p className="mt-4">
                            <strong>Audit:</strong> We reserve the right to audit system logs to investigate reports of fraud or technical anomalies.
                        </p>
                    </CardContent>
                </Card>
            </section>

            <section id="data-usage">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">5. Data Usage & Third Parties</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            We collect basic profile information (name, email, profile picture) via Google OAuth solely to facilitate account creation and organization management. 
                        </p>
                        <p className="mt-4 font-bold">
                            We do not share your personal data with any third-party advertisers, data brokers, or external services.
                        </p>
                    </CardContent>
                </Card>
            </section>

            <section id="termination">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">6. Termination</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            We reserve the right to suspend or terminate accounts found to be in violation of these Terms, particularly in cases of attempted voter fraud or security breaches.
                        </p>
                    </CardContent>
                </Card>
            </section>

            <section id="liability">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">7. Limitation of Liability</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            To the maximum extent permitted by law, E-Voting shall not be liable for any disputes arising from election results, internal organization conflicts, or technical failures beyond our reasonable control.
                        </p>
                    </CardContent>
                </Card>
            </section>

            <section id="contact">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">8. Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            For legal notices or questions about these Terms, please contact:
                        </p>
                        <p className="mt-2">
                            <a href="mailto:legal@sundaresan.dev" className="text-primary font-medium hover:underline">
                                legal@sundaresan.dev
                            </a>
                        </p>
                    </CardContent>
                </Card>
            </section>
        </>
    )
}
