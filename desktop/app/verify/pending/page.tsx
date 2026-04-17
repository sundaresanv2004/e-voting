"use client"

import React, { useEffect, useState } from "react"
import { HugeiconsIcon } from '@hugeicons/react'
import { HourglassIcon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons'
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Cancel01Icon, Alert01Icon } from "@hugeicons/core-free-icons"

export default function PendingApprovalPage() {
    const [status, setStatus] = useState<string>("PENDING")
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

    const handleCancel = async () => {
        setIsCancelling(true);
        try {
            // Delete the record in the cloud
            await (window as any).electron.terminal.cancelRegistration();
            router.push("/auth/connect");
        } catch (e) {
            console.error("Failed to cancel:", e);
        } finally {
            setIsCancelling(false);
        }
    }

    const handleReturn = async () => {
        setIsCancelling(true);
        try {
            // ONLY clear local state, keep cloud record as REJECTED
            await (window as any).electron.terminal.resetRegistrationState();
            router.push("/auth/connect");
        } catch (e) {
            console.error("Failed to return:", e);
        } finally {
            setIsCancelling(false);
        }
    }

    const isRejected = status === "REJECTED";
    const isApproved = status === "APPROVED";

    return (
        <Card className="w-full border-none ring-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2 text-center">
            <CardHeader className="pt-0 md:pt-6">
                <div className="flex justify-center mb-4">
                    <div className="relative">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                            isApproved ? "bg-green-500/10" : isRejected ? "bg-destructive/10" : "bg-primary/10 animate-pulse"
                        }`}>
                            <HugeiconsIcon 
                                icon={isApproved ? CheckmarkCircle02Icon : isRejected ? Alert01Icon : HourglassIcon} 
                                className={`w-10 h-10 ${isApproved ? "text-green-500" : isRejected ? "text-destructive" : "text-primary"}`} 
                            />
                        </div>
                        {!isApproved && !isRejected && (
                            <div className="absolute -bottom-1 -right-1">
                                <Spinner className="w-6 h-6 text-primary" />
                            </div>
                        )}
                    </div>
                </div>
                <CardTitle className={`text-2xl font-bold ${isRejected ? "text-destructive" : ""}`}>
                    {isApproved ? "Connection Approved!" : isRejected ? "Connection Denied" : "Awaiting Approval"}
                </CardTitle>
                <CardDescription>
                    {isApproved 
                        ? "Your terminal has been verified. Redirecting to dashboard..." 
                        : isRejected 
                            ? "Your request was rejected by the administrator. You can return to home to try again."
                            : "Your registration request has been sent to the administrator."}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pb-6 mt-2">
                <div className="bg-muted/50 rounded-xl p-4 text-sm space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">System Name</span>
                        <span className="font-medium">{identity?.systemName || "Terminal"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Organisation</span>
                        <span className="font-medium">{identity?.organizationName || "Loading..."}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Status</span>
                        <span className={`font-bold uppercase ${
                            isApproved ? "text-green-600" : isRejected ? "text-destructive" : "text-amber-600 animate-pulse"
                        }`}>
                            {status}
                        </span>
                    </div>
                </div>

                {!isRejected && !isApproved && (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full gap-2 text-muted-foreground hover:text-destructive hover:border-destructive transition-all"
                        onClick={handleCancel}
                        disabled={isCancelling}
                    >
                        {isCancelling ? <Spinner className="w-3 h-3" /> : <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />}
                        Cancel Request
                    </Button>
                )}

                {isRejected && (
                    <Button 
                        variant="default" 
                        className="w-full"
                        onClick={handleReturn}
                        disabled={isCancelling}
                    >
                        Return to Connect
                    </Button>
                )}

                {!isRejected && (
                    <p className="text-[10px] text-muted-foreground px-4 italic">
                        Please keep this window open. This screen will automatically update once an administrator approves your terminal request.
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
