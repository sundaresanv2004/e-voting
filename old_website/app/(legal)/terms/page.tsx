import { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
    title: "Terms of Service | E-Voting",
    description: "The terms that apply when you use the E-Voting platform.",
}

export default function TermsPage() {
    return (
        <>
            <Card className="mb-4 sm:mb-10 bg-muted/50 border-muted">
                <CardContent>
                    <p className="text-sm font-medium text-foreground m-0">
                        <strong>Agreement:</strong> By using E-Voting, you agree to these Terms of Service and to use the platform only for lawful, authorized election-related purposes.
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
                            These Terms of Service (&#34;Terms&#34;) govern your access to and use of E-Voting. By accessing the platform, creating an account, signing in, managing an election, or participating in an election, you agree to be bound by these Terms.
                        </p>
                    </CardContent>
                </Card>
            </section>

            <section id="accounts">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">2. Accounts and Eligibility</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            You may use E-Voting only if you are authorized by your organization or otherwise permitted to access the service.
                        </p>
                        <p className="mt-4">
                            If you use Google Sign-In, you authorize us to receive your basic Google profile information and primary email address for account authentication and account setup.
                        </p>
                        <p className="mt-4">
                            You are responsible for maintaining the confidentiality of your credentials and for all activity that occurs under your account.
                        </p>
                    </CardContent>
                </Card>
            </section>

            <section id="acceptable-use">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">3. Acceptable Use</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>You agree not to:</p>
                        <ul className="list-disc pl-6 space-y-2 mt-4">
                            <li>Access elections, organizations, or administrative features without authorization.</li>
                            <li>Attempt to impersonate another user, administrator, or voter.</li>
                            <li>Interfere with platform operations, security controls, audit systems, or vote integrity.</li>
                            <li>Use automated or deceptive methods to gain unauthorized access to data or features.</li>
                            <li>Use the platform in violation of applicable law or the internal rules of your organization.</li>
                        </ul>
                    </CardContent>
                </Card>
            </section>

            <section id="organization-responsibility">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">4. Organization Responsibility</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            Organization administrators are responsible for the elections they create, including ballot content, voter eligibility, candidate information, and internal election procedures.
                        </p>
                        <p className="mt-4">
                            E-Voting provides the software platform but does not determine the rules, results validity, or legitimacy of any organization&#39;s election process.
                        </p>
                    </CardContent>
                </Card>
            </section>

            <section id="privacy">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">5. Privacy and Data Use</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            Our collection and use of personal information are described in our Privacy Policy. By using E-Voting, you acknowledge that we may process account, organization, election, and security-related information as described there.
                        </p>
                    </CardContent>
                </Card>
            </section>

            <section id="suspension">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">6. Suspension and Termination</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            We may suspend, restrict, or terminate access to the platform if we reasonably believe a user or organization is violating these Terms, creating security risk, misusing the service, or acting in a way that threatens election integrity or platform stability.
                        </p>
                    </CardContent>
                </Card>
            </section>

            <section id="availability">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">7. Availability and Changes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            We may update, improve, modify, or discontinue parts of the service from time to time. We do not guarantee uninterrupted or error-free operation, although we aim to keep the platform reliable and secure.
                        </p>
                    </CardContent>
                </Card>
            </section>

            <section id="liability">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">8. Limitation of Liability</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            To the maximum extent permitted by law, E-Voting is not liable for indirect, incidental, special, consequential, or punitive damages, or for disputes arising from election outcomes, organization decisions, or circumstances beyond our reasonable control.
                        </p>
                    </CardContent>
                </Card>
            </section>

            <section id="contact">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">9. Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            For legal notices or questions about these Terms, contact:
                        </p>
                        <p className="mt-2">
                            <a href="mailto:legal@evoting.sundaresan.dev" className="text-primary font-medium hover:underline">
                                legal@evoting.sundaresan.dev
                            </a>
                        </p>
                    </CardContent>
                </Card>
            </section>
        </>
    )
}
