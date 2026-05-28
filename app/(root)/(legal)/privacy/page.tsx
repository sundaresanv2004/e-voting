import { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
    title: "Privacy Policy | E-Voting",
    description: "Learn what data E-Voting collects, how it is used, and how it is protected.",
}

export default function PrivacyPolicyPage() {
    return (
        <>
            <div className="text-center mb-12 sm:mb-16">
                <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                    Privacy Policy
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Learn what data E-Voting collects, how it is used, and how it is protected.
                </p>
            </div>

            <div className="space-y-6">
                {/* Summary Card */}
                <Card className="bg-muted/50 border-muted pt-0">
                    <CardContent className="pt-6">
                        <p className="text-sm font-medium text-foreground m-0">
                            <strong>Summary:</strong> E-Voting uses only the information needed to create accounts, manage elections, and protect platform security. For Google Sign-In, we request only basic profile information and primary email address.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-sm">1</span>
                            Introduction
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground leading-relaxed">
                        <p>
                            This Privacy Policy explains how E-Voting (&#34;we,&#34; &#34;our,&#34; or &#34;us&#34;) collects, uses, stores, and protects personal information when you use our website and related services. E-Voting provides election management tools for organizations such as schools, colleges, and other groups.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-sm">2</span>
                            Information We Collect
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-6 space-y-3 text-muted-foreground leading-relaxed">
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

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-sm">3</span>
                            How We Use Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-muted-foreground leading-relaxed">We use collected information only to operate and secure E-Voting.</p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                            <li>To create and maintain user accounts.</li>
                            <li>To authenticate users and allow access to the correct organization and elections.</li>
                            <li>To manage elections, members, candidates, voter records, and related administrative settings.</li>
                            <li>To send essential account, security, and election-related emails.</li>
                            <li>To detect abuse, investigate issues, and protect the reliability and security of the platform.</li>
                            <li>To comply with legal obligations and respond to lawful requests when required.</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-sm">4</span>
                            Google User Data
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground leading-relaxed space-y-4">
                        <p>
                            When you use Google Sign-In, E-Voting uses Google user data only for authentication, account creation, account linking, and display of your basic profile information inside the product.
                        </p>
                        <p>
                            We do <strong>not</strong> use Google user data for advertising, profiling, sale to data brokers, or any unrelated purpose. We do not request sensitive or restricted Google scopes for this application.
                        </p>
                    </CardContent>
                </Card>

                <div className="grid sm:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs">5</span>
                                Sharing of Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground leading-relaxed space-y-4">
                            <p>
                                We do not sell personal information. We do not share personal information with advertisers or data brokers.
                            </p>
                            <p>
                                We may share limited information with service providers that help us operate the platform, such as hosting, database, email delivery, authentication, or media storage providers, only as needed to provide the service.
                            </p>
                            <p>
                                We may also disclose information if required by law, to enforce our terms, or to protect the security, rights, or integrity of our users, organizations, or platform.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs">6</span>
                                Data Retention
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground leading-relaxed">
                            <p>
                                We retain account, election, and audit information only as long as reasonably necessary to operate the service, support organizations, maintain security records, resolve disputes, or comply with legal obligations.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-sm">7</span>
                            Security
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground leading-relaxed">
                        <p>
                            We use reasonable technical and organizational safeguards to protect personal information against unauthorized access, misuse, alteration, or disclosure. No method of transmission or storage is guaranteed to be completely secure, but we work to protect the data entrusted to us.
                        </p>
                    </CardContent>
                </Card>

                <div className="grid sm:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs">8</span>
                                Your Choices and Rights
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground leading-relaxed">
                            <p>
                                You may contact us to request account deletion, correction of inaccurate information, or privacy-related assistance. If you signed in with Google, you may also manage connected app access through your Google account settings.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs">9</span>
                                Contact Us
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground leading-relaxed">
                            <p>
                                For privacy questions, requests, or concerns, contact us at:
                            </p>
                            <p className="mt-2">
                                <a href="mailto:privacy@evoting.sundaresan.dev" className="text-primary font-medium hover:underline">
                                    privacy@evoting.sundaresan.dev
                                </a>
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}
