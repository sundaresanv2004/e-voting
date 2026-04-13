"use client"

import React from "react"
import { HugeiconsIcon } from '@hugeicons/react'
import { ShieldUserIcon, Cancel01Icon } from '@hugeicons/core-free-icons'
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTerminal } from "@/components/shared/terminal-context"

export default function RevokedPage() {
    const { terminal } = useTerminal()
    const router = useRouter()

    const handleBackToHome = async () => {
        // Since it's revoked, the user usually needs to start over or contact admin
        // We'll clear the local state to let them try registering again
        await (window as any).electron.terminal.resetRegistrationState();
        router.push("/auth/connect")
    }

    return (
        <Card className="w-full border-none ring-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2 text-center">
            <CardHeader className="pt-0 md:pt-6">
                <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                        <HugeiconsIcon
                            icon={ShieldUserIcon}
                            className="w-10 h-10 text-destructive"
                        />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold text-destructive">
                    Access Revoked
                </CardTitle>
                <CardDescription className="text-base text-balance mt-2">
                    This terminal&apos;s authorization has been revoked by the system administrator.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pb-6">
                <div className="bg-muted/50 rounded-xl p-5 text-sm space-y-4">
                    <p className="text-muted-foreground leading-relaxed italic">
                        &quot;For security reasons, this terminal has been disconnected from the network. This can happen if the terminal remained inactive for too long or if the administrator manually revoked your access.&quot;
                    </p>

                    <div className="pt-2">
                        <div className="flex justify-between items-center py-2 border-t border-border/50">
                            <span className="text-muted-foreground">Terminal Name</span>
                            <span className="font-medium">{terminal.systemName}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-t border-border/50">
                            <span className="text-muted-foreground">Organisation</span>
                            <span className="font-medium">{terminal.organizationName}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <Button
                        variant="default"
                        className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        onClick={handleBackToHome}
                    >
                        <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4 mr-2" />
                        Close and Reset Terminal
                    </Button>

                    <p className="text-xs text-muted-foreground px-4">
                        If you believe this is an error, please contact your organization administrator with the Terminal Name provided above.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
