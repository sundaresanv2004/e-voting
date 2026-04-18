import { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
    title: "Privacy Policy | E-Voting",
    description: "Learn what data E-Voting collects, how it is used, and how it is protected.",
}

export default function PrivacyPolicyPage() {
    return (
        <>
            <Card className="mb-4 sm:mb-10 bg-muted/50 border-muted">
                <CardContent>
                    <p className="text-sm font-medium text-foreground m-0">
                        <strong>Summary:</strong> E-Voting uses only the information needed to create accounts, manage elections, and protect platform security. For Google Sign-In, we request only basic profile information and primary email address.
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
                            This Privacy Policy explains how E-Voting (&#34;we,&#34; &#34;our,&#34; or &#34;us&#34;) collects, uses, stores, and protects personal information when you use our website and related services. E-Voting provides election management tools for organizations such as schools, colleges, and other groups.
                        </p>
                    </CardContent>
                </Card>
            </section>

            <section id="information-we-collect">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">2. Information We Collect</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-6 space-y-3">
                            <li>
                                <strong>Google account information:</strong> If you sign in with Google, we access only your name, email address, and basic profile image made available through Google&#39;s `userinfo.email` and `userinfo.profile` scopes.
                            </li>
                            <li>
                                <strong>Account information:</strong> If you register directly, we collect your name, email address, and encrypted password.
                            </li>
                            <li>
                                <strong>Organization and election data:</strong> Organization name, organization type, optional logo, election details, authorized members, candidates, voter roll information, and election settings entered by your organization.
                            </li>
                            <li>
                                <strong>Security and audit data:</strong> We may store login timestamps, IP address information, device or browser information, and administrative audit logs to help detect misuse, investigate incidents, and maintain election integrity.
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </section>

            <section id="how-we-use-data">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">3. How We Use Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>We use collected information only to operate and secure E-Voting.</p>
                        <ul className="list-disc pl-6 space-y-2 mt-4">
                            <li>To create and maintain user accounts.</li>
                            <li>To authenticate users and allow access to the correct organization and elections.</li>
                            <li>To manage elections, members, candidates, voter records, and related administrative settings.</li>
                            <li>To send essential account, security, and election-related emails.</li>
                            <li>To detect abuse, investigate issues, and protect the reliability and security of the platform.</li>
                            <li>To comply with legal obligations and respond to lawful requests when required.</li>
                        </ul>
                    </CardContent>
                </Card>
            </section>

            <section id="google-data">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">4. Google User Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            When you use Google Sign-In, E-Voting uses Google user data only for authentication, account creation, account linking, and display of your basic profile information inside the product.
                        </p>
                        <p className="mt-4">
                            We do <strong>not</strong> use Google user data for advertising, profiling, sale to data brokers, or any unrelated purpose. We do not request sensitive or restricted Google scopes for this application.
                        </p>
                    </CardContent>
                </Card>
            </section>

            <section id="sharing">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">5. Sharing of Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            We do not sell personal information. We do not share personal information with advertisers or data brokers.
                        </p>
                        <p className="mt-4">
                            We may share limited information with service providers that help us operate the platform, such as hosting, database, email delivery, authentication, or media storage providers, only as needed to provide the service.
                        </p>
                        <p className="mt-4">
                            We may also disclose information if required by law, to enforce our terms, or to protect the security, rights, or integrity of our users, organizations, or platform.
                        </p>
                    </CardContent>
                </Card>
            </section>

            <section id="retention">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">6. Data Retention</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            We retain account, election, and audit information only as long as reasonably necessary to operate the service, support organizations, maintain security records, resolve disputes, or comply with legal obligations.
                        </p>
                    </CardContent>
                </Card>
            </section>

            <section id="security">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">7. Security</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            We use reasonable technical and organizational safeguards to protect personal information against unauthorized access, misuse, alteration, or disclosure. No method of transmission or storage is guaranteed to be completely secure, but we work to protect the data entrusted to us.
                        </p>
                    </CardContent>
                </Card>
            </section>

            <section id="your-rights">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">8. Your Choices and Rights</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            You may contact us to request account deletion, correction of inaccurate information, or privacy-related assistance. If you signed in with Google, you may also manage connected app access through your Google account settings.
                        </p>
                    </CardContent>
                </Card>
            </section>

            <section id="contact">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">9. Contact Us</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            For privacy questions, requests, or concerns, contact us at:
                        </p>
                        <p className="mt-2">
                            <a href="mailto:privacy@sundaresan.dev" className="text-primary font-medium hover:underline">
                                privacy@sundaresan.dev
                            </a>
                        </p>
                    </CardContent>
                </Card>
            </section>
        </>
    )
}
