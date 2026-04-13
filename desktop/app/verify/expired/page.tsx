"use client"

import React, { useEffect, useState } from "react"
import { HugeiconsIcon } from '@hugeicons/react'
import { HourglassIcon, CheckmarkCircle02Icon, Clock01Icon, Cancel01Icon } from '@hugeicons/core-free-icons'
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export default function ExpiredSessionPage() {
    const [status, setStatus] = useState<string>("EXPIRED")
    const [identity, setIdentity] = useState<any>(null)
    const [isCancelling, setIsCancelling] = useState(false)
    const router = useRouter()

    useEffect(() => {
        // 1. Fetch current identity info
        const fetchIdentity = async () => {
            const id = await (window as any).electron.terminal.getIdentity();
            const currentStatus = await (window as any).electron.terminal.getStatus();
            setIdentity(id);
            setStatus(currentStatus);
        };
        fetchIdentity();

        // 2. Listen for status updates from Main Process
        const unsub = (window as any).electron.terminal.onStatusUpdate((newStatus: string) => {
            setStatus(newStatus);
            if (newStatus === "APPROVED") {
                // Short delay to show success state
                setTimeout(() => router.push("/dashboard"), 1500);
            }
        });

        return () => {
            if (unsub) unsub();
        }
    }, [router])

    const handleTerminateLocal = async () => {
        setIsCancelling(true);
        try {
            // ONLY clear local state, DO NOT delete cloud record as requested
            // This allows the admin to still see the expired terminal but disconnects local app
            await (window as any).electron.terminal.resetRegistrationState();
            router.push("/auth/connect");
        } catch (e) {
            console.error("Failed to terminate local data:", e);
        } finally {
            setIsCancelling(false);
        }
    }

    const isApproved = status === "APPROVED";

    return (
        <Card className="w-full border-none ring-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2 text-center">
            <CardHeader className="pt-0 md:pt-6">
                <div className="flex justify-center mb-4">
                    <div className="relative">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isApproved ? "bg-green-500/10" : "bg-amber-500/10 animate-pulse"
                            }`}>
                            <HugeiconsIcon
                                icon={isApproved ? CheckmarkCircle02Icon : Clock01Icon}
                                className={`w-10 h-10 ${isApproved ? "text-green-500" : "text-amber-500"}`}
                            />
                        </div>
                        {!isApproved && (
                            <div className="absolute -bottom-1 -right-1">
                                <Spinner className="w-6 h-6 text-amber-500" />
                            </div>
                        )}
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold">
                    {isApproved ? "Session Renewed!" : "Session Expired"}
                </CardTitle>
                <CardDescription>
                    {isApproved
                        ? "Your terminal access has been renewed. Redirecting..."
                        : "Your security token has expired. Waiting for administrator to re-authorize this terminal."}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pb-6 mt-2">
                <div className="bg-muted/50 rounded-xl p-4 text-sm space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Terminal Name</span>
                        <span className="font-medium">{identity?.systemName || "Terminal"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Organisation</span>
                        <span className="font-medium">{identity?.organizationName || "Loading..."}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Status</span>
                        <span className={`font-bold uppercase ${isApproved ? "text-green-600" : "text-amber-600 animate-pulse"
                            }`}>
                            {status}
                        </span>
                    </div>
                </div>

                {!isApproved && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all font-normal"
                        onClick={handleTerminateLocal}
                        disabled={isCancelling}
                    >
                        {isCancelling ? <Spinner className="w-3 h-3" /> : <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />}
                        Terminate Local Session
                    </Button>
                )}

                {!isApproved && (
                    <p className="text-xs text-muted-foreground px-4 italic leading-relaxed">
                        Security tokens expire periodically for your protection. Once the admin approves your renewal, you will be automatically signed back in.
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
