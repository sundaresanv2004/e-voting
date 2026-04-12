"use client"

import React, { useState, useEffect, Suspense } from "react"
import { HugeiconsIcon } from '@hugeicons/react'
import { CheckmarkCircle01Icon, Alert01Icon, Clock01Icon } from '@hugeicons/core-free-icons'
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { secureGet, secureSave, secureDelete, plainGet, plainSave, plainDelete, plainClear } from "@/lib/utils/secure-storage"

function PendingConnectionContent() {
    const [status, setStatus] = useState<"pending" | "approved" | "error" | "expired">("pending")
    const [error, setError] = useState<string | null>(null)
    const [systemId, setSystemId] = useState<string | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams()
    const nextParam = searchParams.get("next")

    useEffect(() => {
        const init = async () => {
            const id = await secureGet("systemId");
            const localStatus = await plainGet<string>("systemStatus");
            setSystemId(id);
            if (localStatus === "EXPIRED") setStatus("expired");
        };
        init();
    }, []);

    useEffect(() => {
        if ((status !== "pending" && status !== "expired") || !systemId) return;

        const checkStatus = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
                const res = await fetch(`${apiUrl}/api/v1/organizations/systems/${systemId}/status`);
                if (!res.ok) {
                    if (res.status === 404) {
                        setStatus("error");
                        setError("Your connection request was rejected or the system does not exist.");
                        await secureDelete("systemId");
                        await plainDelete("systemStatus");
                    }
                    return;
                }

                const data = await res.json();

                // Update local plain status for instant guard detection
                await plainSave("systemStatus", data.status);
                await plainSave("lastUpdatedAt", new Date().toISOString());

                if (data.status === "APPROVED") {
                    // Secure Storage
                    await secureSave("secretToken", data.secretToken);

                    // Plain Store Metadata (ONLY ON APPROVAL)
                    await plainSave("organizationName", data.organizationName);
                    if (data.organizationLogo) {
                        await plainSave("organizationLogo", data.organizationLogo);
                    }
                    if (data.tokenExpiresAt) {
                        await plainSave("tokenExpiresAt", data.tokenExpiresAt);
                    }

                    setStatus("approved");
                    setTimeout(() => {
                        router.push(nextParam || "/");
                    }, 1500);
                } else if (data.status === "REJECTED" || data.status === "REVOKED") {
                    setStatus("error");
                    setError(`Your request was ${data.status.toLowerCase()}.`);
                } else if (data.status === "PENDING") {
                    setStatus("pending");
                }
            } catch (err) {
                console.error("Failed to poll status", err);
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 10000);
        return () => clearInterval(interval);
    }, [status, systemId, router, nextParam]);

    // ... (rest of the component)

    const handleCancel = async () => {
        if (systemId) {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
                await fetch(`${apiUrl}/api/v1/organizations/systems/${systemId}`, {
                    method: 'DELETE'
                });
            } catch (e) {
                console.error("Failed to notify backend of cancellation", e);
            }
        }
        await secureDelete("systemId");
        await plainClear(); // Wipe everything on cancel
        router.replace("/auth/connect");
    }

    if (status === "expired") {
        return (
            <Card className="w-full border-none ring-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2">
                <CardHeader className="text-center pt-0 md:pt-6 px-0 md:px-6">
                    <div className="flex justify-center mb-4">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
                                <HugeiconsIcon icon={Clock01Icon} className="w-8 h-8 text-yellow-500" />
                            </div>
                            <div className="absolute -top-1 -right-1">
                                <Spinner className="h-5 w-5 text-yellow-600" />
                            </div>
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Token Expired</CardTitle>
                    <CardDescription className="text-base font-medium">
                        Kindly approve it again to get access or contact your organization admin.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0 md:px-6 flex justify-center mb-4">
                    <Button variant="outline" className="rounded-full px-8" onClick={handleCancel}>
                        Cancel Request
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (status === "approved") {
        return (
            <Card className="w-full border-none ring-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2">
                <CardHeader className="text-center pt-0 md:pt-6 px-0 md:px-6 mb-4">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center animate-in zoom-in duration-300">
                            <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-8 h-8 text-green-500" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Connection Approved!</CardTitle>
                    <CardDescription>Redirecting to your dashboard...</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (status === "error") {
        return (
            <Card className="w-full border-none ring-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2">
                <CardHeader className="text-center pt-0 md:pt-6 px-0 md:px-6">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center animate-in zoom-in duration-300">
                            <HugeiconsIcon icon={Alert01Icon} className="w-8 h-8 text-destructive" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Request Failed</CardTitle>
                    <CardDescription>{error}</CardDescription>
                </CardHeader>
                <CardContent className="px-0 md:px-6 flex justify-center mb-4">
                    <Button variant="outline" className="rounded-full px-8" onClick={() => router.replace("/")}>
                        Go Back
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full border-none ring-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2">
            <CardHeader className="text-center pt-0 md:pt-6 px-0 md:px-6">
                <div className="flex justify-center mb-4">
                    <div className="relative flex items-center justify-center">
                        <div className="absolute w-20 h-20 rounded-full border-4 border-muted/30 border-t-primary animate-[spin_3s_linear_infinite]" />
                        <div className="w-16 h-16 rounded-full flex items-center justify-center z-10">
                            <Spinner className="size-8 text-primary" />
                        </div>
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold">Waiting for Approval</CardTitle>
                <CardDescription className="max-w-[300px] mx-auto">
                    Your system connection request has been sent. Please wait for an administrator to approve it from the dashboard.
                </CardDescription>
            </CardHeader>
            <CardFooter className="px-0 md:px-6 flex justify-center pt-2 mb-4">
                <Button variant="secondary" className="px-8 font-medium" onClick={handleCancel}>
                    Cancel Request
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function PendingPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><Spinner /></div>}>
            <PendingConnectionContent />
        </Suspense>
    )
}
