import { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
    title: "Terms of Service | E-Voting",
    description: "The terms that apply when you use the E-Voting platform.",
}

export default function TermsPage() {
    return (
        <>
            <div className="text-center mb-12 sm:mb-16">
                <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                    Terms of Service
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    The terms that apply when you use the E-Voting platform.
                </p>
            </div>

            <div className="space-y-6">
                <Card className="bg-muted/50 border-muted pt-0">
                    <CardContent className="pt-6">
                        <p className="text-sm font-medium text-foreground m-0">
                            <strong>Agreement:</strong> By using E-Voting, you agree to these Terms of Service and to use the platform only for lawful, authorized election-related purposes.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-sm">1</span>
                            Acceptance of Terms
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                            These Terms of Service (&#34;Terms&#34;) govern your access to and use of E-Voting. By accessing the platform, creating an account, signing in, managing an election, or participating in an election, you agree to be bound by these Terms.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-sm">2</span>
                            Accounts and Eligibility
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground leading-relaxed">
                            You may use E-Voting only if you are authorized by your organization or otherwise permitted to access the service.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            If you use Google Sign-In, you authorize us to receive your basic Google profile information and primary email address for account authentication and account setup.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            You are responsible for maintaining the confidentiality of your credentials and for all activity that occurs under your account.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-sm">3</span>
                            Acceptable Use
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-muted-foreground leading-relaxed">You agree not to:</p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                            <li>Access elections, organizations, or administrative features without authorization.</li>
                            <li>Attempt to impersonate another user, administrator, or voter.</li>
                            <li>Interfere with platform operations, security controls, audit systems, or vote integrity.</li>
                            <li>Use automated or deceptive methods to gain unauthorized access to data or features.</li>
                            <li>Use the platform in violation of applicable law or the internal rules of your organization.</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-sm">4</span>
                            Organization Responsibility
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
                        <p>
                            Organization administrators are responsible for the elections they create, including ballot content, voter eligibility, candidate information, and internal election procedures.
                        </p>
                        <p>
                            E-Voting provides the software platform but does not determine the rules, results validity, or legitimacy of any organization&#39;s election process.
                        </p>
                    </CardContent>
                </Card>

                <div className="grid sm:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs">5</span>
                                Privacy and Data Use
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground leading-relaxed">
                            <p>
                                Our collection and use of personal information are described in our Privacy Policy. By using E-Voting, you acknowledge that we may process account, organization, election, and security-related information as described there.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs">6</span>
                                Suspension and Termination
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground leading-relaxed">
                            <p>
                                We may suspend, restrict, or terminate access to the platform if we reasonably believe a user or organization is violating these Terms, creating security risk, misusing the service, or acting in a way that threatens election integrity or platform stability.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs">7</span>
                                Availability and Changes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground leading-relaxed">
                            <p>
                                We may update, improve, modify, or discontinue parts of the service from time to time. We do not guarantee uninterrupted or error-free operation, although we aim to keep the platform reliable and secure.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs">8</span>
                                Limitation of Liability
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground leading-relaxed">
                            <p>
                                To the maximum extent permitted by law, E-Voting is not liable for indirect, incidental, special, consequential, or punitive damages, or for disputes arising from election outcomes, organization decisions, or circumstances beyond our reasonable control.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-sm">9</span>
                            Contact Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground leading-relaxed">
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
            </div>
        </>
    )
}
