import { Metadata } from "next"
import { LegalLayout } from "@/components/legal/legal-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
    title: "Privacy Policy | E-Voting",
    description: "Learn how E-Voting collects, uses, and protects your personal information.",
}

const SECTIONS = [
    { id: "introduction", title: "1. Introduction" },
    { id: "data-collection", title: "2. Data Collection" },
    { id: "vote-anonymity", title: "3. Vote Anonymity & Security" },
    { id: "data-usage", title: "4. How We Use Data" },
    { id: "data-retention", title: "5. Data Retention" },
    { id: "contact", title: "6. Contact Us" },
]

export default function PrivacyPolicyPage() {
    return (
        <LegalLayout
            title="Privacy Policy"
            lastUpdated="December 27, 2025"
            sections={SECTIONS}
        >
            <Card className="mb-4 sm:mb-10 bg-muted/50 border-muted">
                <CardContent>
                    <p className="text-sm font-medium text-foreground m-0">
                        <strong>Summary:</strong> E-Voting is committed to the highest standards of data privacy and election integrity. We ensure your vote remains anonymous and your personal data is secure.
                    </p>
                </CardContent>
            </Card>

            <section id="introduction">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">1. Introduction</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            Welcome to E-Voting (&#34;we,&#34; &#34;our,&#34; or &#34;us&#34;). We provide a secure online voting platform for organizations, schools, and communities. This Privacy Policy outlines how we handle your personal information and voting data to ensure transparency and trust.
                        </p>
                    </CardContent>
                </Card>
            </section>

            <section id="data-collection">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">2. Data Collection</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            To facilitate fair and authenticated elections, we collect the following information:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-4">
                            <li>
                                <strong>Authentication Data (via Google OAuth):</strong> When you sign in using Google, we collect your name and email address. This authentication is handled securely through Google&#39;s OAuth 2.0 service, and we do not have access to your Google password.
                            </li>
                            <li>
                                <strong>Organization Information:</strong> For organization administrators, we collect:
                                <ul className="list-disc pl-6 mt-2">
                                    <li>Organization name (required) - school, college, or organization</li>
                                    <li>Organization logo (optional) - for ballot branding and customization</li>
                                    <li>Additional metadata (optional) - such as organization type, size, and other details to enhance your voting experience</li>
                                </ul>
                            </li>
                            <li>
                                <strong>Voter Identity:</strong> Organization ID and voter eligibility information to verify your participation in specific elections.
                            </li>
                            <li>
                                <strong>Authentication Logs:</strong> IP address and timestamp of login and voting actions for audit trails and security purposes.
                            </li>
                            <li>
                                <strong>Contact Form Data:</strong> Information you provide when contacting our support team, including name, email, phone (optional), and message content.
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </section>

            <section id="vote-anonymity">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">3. Vote Anonymity & Security</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            <strong>Your Vote is Secret:</strong> We employ cryptographic measures to separate your identity from your cast ballot. Once a vote is cast, it is encrypted and stored in a manner that prevents tracing it back to the individual voter, even by system administrators.
                        </p>
                        <p className="mt-4">
                            <strong>Integrity Checks:</strong> We use industry-standard security protocols (Row Level Security, Encryption at Rest) to prevent unauthorized tampering with election results.
                        </p>
                    </CardContent>
                </Card>
            </section>

            <section id="data-usage">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">4. How We Use Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            We use your data solely for the purpose of conducting elections and managing the platform:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-4">
                            <li>To authenticate you as a valid voter for a specific election using Google OAuth.</li>
                            <li>To set up and manage your organization&#39;s elections and voting processes.</li>
                            <li>To customize ballots with your organization&#39;s branding (logo and name).</li>
                            <li>To prevent double-voting and ensure one-person-one-vote integrity.</li>
                            <li>To notify you of upcoming elections, results publishing, or important updates.</li>
                            <li>To maintain the security, stability, and reliability of the platform.</li>
                            <li>To provide customer support and respond to your inquiries.</li>
                        </ul>
                    </CardContent>
                </Card>
            </section>

            <section id="data-retention">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">5. Data Retention</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            We retain election data for a period determined by the organization administrator or as required by law for audit purposes. After the retention period expries, personal data is anonymized or deleted.
                        </p>
                    </CardContent>
                </Card>
            </section>

            <section id="contact">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">6. Contact Us</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            For inquiries regarding data privacy or to exercise your data rights, please contact our Data Protection Officer at:
                        </p>
                        <p className="mt-2">
                            <a href="mailto:privacy@evoting.sundaresan.dev" className="text-primary font-medium hover:underline">
                                privacy@evoting.sundaresan.dev
                            </a>
                        </p>
                    </CardContent>
                </Card>
            </section>
        </LegalLayout>
    )
}
