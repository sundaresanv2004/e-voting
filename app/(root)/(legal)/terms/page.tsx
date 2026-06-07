import { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
    title: "Terms of Service | E-Voting",
    description: "The terms that apply when you use this self-hosted E-Voting platform.",
}

export default function TermsPage() {
    return (
        <>
            <div className="text-center mb-12 sm:mb-16">
                <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                    Terms of Service
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    The terms that apply when you use this self-hosted E-Voting platform.
                </p>
            </div>

            <div className="space-y-6">
                <Card className="bg-muted/50 border-muted pt-0">
                    <CardContent className="pt-6">
                        <p className="text-sm font-medium text-foreground m-0">
                            <strong>Agreement:</strong> By using this E-Voting instance, you agree to these Terms of Service and to use the platform only for lawful, authorized election-related purposes as defined by the hosting organization (e.g., your school or institution).
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-sm">1</span>
                            Self-Hosted Instance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                            This application is a self-hosted, independent deployment of the E-Voting software. The organization hosting this instance is entirely responsible for its administration, election integrity, and user management.
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
                            You may use this platform only if you are authorized by the hosting organization. If you use Google Sign-In, you authorize the platform to receive your basic Google profile information for authentication purposes.
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
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-sm">4</span>
                            Contact Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground leading-relaxed">
                        <p>
                            For questions about these Terms, contact the organization hosting this instance:
                        </p>
                        <p className="mt-2">
                            {process.env.NEXT_PUBLIC_CONTACT_MAIL ? (
                                <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_MAIL}`} className="text-primary font-medium hover:underline">
                                    {process.env.NEXT_PUBLIC_CONTACT_MAIL}
                                </a>
                            ) : (
                                "no contact is given"
                            )}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
