import { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
    title: "Privacy Policy | E-Voting",
    description: "Learn what data this self-hosted E-Voting instance collects and how it is used.",
}

export default function PrivacyPolicyPage() {
    return (
        <>
            <div className="text-center mb-12 sm:mb-16">
                <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                    Privacy Policy
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Learn what data this self-hosted E-Voting instance collects and how it is used.
                </p>
            </div>

            <div className="space-y-6">
                <Card className="bg-muted/50 border-muted pt-0">
                    <CardContent className="pt-6">
                        <p className="text-sm font-medium text-foreground m-0">
                            <strong>Summary:</strong> This is a self-hosted, independent instance of the E-Voting platform. All data is stored and managed locally by the hosting organization (e.g., your school). We do not share, sell, or distribute your data to any third parties.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-sm">1</span>
                            Data Collection and Use
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground leading-relaxed">
                        <p>
                            We only collect the information necessary to facilitate elections for our organization. This includes your name, email address, and voting records. This data is kept strictly confidential and is used solely for the purpose of ensuring secure and verifiable elections within our institution.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-sm">2</span>
                            Google User Data
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground leading-relaxed space-y-4">
                        <p>
                            If you choose to use Google Sign-In, we will only access your basic profile information (name and email address) to authenticate you. This information is required to verify your identity and ensure that only authorized members of our organization can vote.
                        </p>
                        <p>
                            We <strong>do not</strong> use Google user data for advertising, and we do not share this data with any external organizations or data brokers.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-sm">3</span>
                            Data Sharing
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground leading-relaxed">
                        <p>
                            Because this application is self-hosted and operated internally by our organization, your data never leaves our controlled environment. We do not sell or share any personal information.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-sm">4</span>
                            Contact Us
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground leading-relaxed">
                        <p>
                            If you have questions about how your data is handled within this application, please contact the administrators at:
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
