"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink } from "@/components/shared/external-link"


export default function TermsPage() {
    return (
        <>
            <Card className="mb-4 sm:mb-10 bg-muted/50 border-muted">
                <CardContent>
                    <p className="text-sm font-medium text-foreground m-0">
                        <strong>Agreement:</strong> By downloading and accessing the E-Voting Application, you agree to abide by these Terms. Our platform ensures secure, fair, and transparent elections for all users.
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
                            These Terms of Service (&#34;Terms&#34;) constitute a binding legal agreement between you and E-Voting. By downloading, installing, or logging into our desktop application, you accept these Terms in full.
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
                            <strong>Account Security:</strong> You are responsible for safeguarding your credentials, including the physical security of the device where our application is installed. Any vote cast from your authenticated account is deemed to be cast by you. Sharing account access or device access during an active voting session is strictly prohibited.
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
                            <li>Attempt to vote more than once per election or circumvent the application&#39;s security protocols.</li>
                            <li>Decompile, reverse-engineer, or tamper with the desktop application binaries.</li>
                            <li>Interfere with the secure connection between the application and our remote backend servers.</li>
                            <li>Impersonate another voter or administrator using their OAuth credentials.</li>
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
                            <strong>Platform Neutrality:</strong> E-Voting acts as a neutral platform software provider. We do not influence election outcomes. Discrepancies in ballot content are the responsibility of the Organization Administrator.
                        </p>
                    </CardContent>
                </Card>
            </section>

            <section id="termination">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">5. Termination</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            We reserve the right to suspend or terminate accounts, and revoke application access for any user found to be in violation of these Terms or manipulating the desktop client.
                        </p>
                    </CardContent>
                </Card>
            </section>

            <section id="liability">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">6. Limitation of Liability</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            To the maximum extent permitted by law, the E-Voting application is provided &#34;as is&#34;. We shall not be liable for any disputes arising from local device issues, malware on your personal machine, network failures, or technical anomalies beyond our reasonable control.
                        </p>
                    </CardContent>
                </Card>
            </section>

            <section id="contact">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">7. Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            For legal notices or questions about these Terms, please contact:
                        </p>
                        <p className="mt-2">
                            <ExternalLink href="mailto:legal@evoting.sundaresan.dev" className="text-primary font-medium hover:underline cursor-pointer">
                                legal@evoting.sundaresan.dev
                            </ExternalLink>
                        </p>
                    </CardContent>
                </Card>
            </section>
        </>
    )
}
