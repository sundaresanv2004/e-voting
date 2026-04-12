"use client"

import React, { useState, useTransition, Suspense } from "react"
import { HugeiconsIcon } from '@hugeicons/react'
import { ViewIcon, ViewOffSlashIcon, Alert01Icon } from '@hugeicons/core-free-icons'
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { OrganizationConnectSchema, OrganizationConnectValues } from "@/lib/schemas/organization"

import { useEffect } from "react"

// Helper to gracefully get the Tauri store or fallback to localStorage for dev
const getStore = async () => {
    try {
        const { Store } = await import('@tauri-apps/plugin-store');
        return new Store('auth_store.bin');
    } catch (e) {
        // Fallback for typical web browsers
        return {
            get: async (key: string) => localStorage.getItem(key),
            set: async (key: string, val: string) => localStorage.setItem(key, val),
            save: async () => {},
        };
    }
};

type ConnectionState = "idle" | "pending" | "approved" | "error";

function OrganizationConnectForm() {
    const [connectionState, setConnectionState] = useState<ConnectionState>("idle")
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [systemId, setSystemId] = useState<string | null>(null)
    const searchParams = useSearchParams()
    const nextParam = searchParams.get("next")
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<OrganizationConnectValues>({
        resolver: zodResolver(OrganizationConnectSchema),
        defaultValues: {
            organizationCode: "",
            systemName: "",
        }
    })

    // 1. Initial Load: Check if we are already pending a connection
    useEffect(() => {
        const init = async () => {
            const store = await getStore();
            const savedSystemId = await store.get("systemId") as string | null;
            if (savedSystemId) {
                setSystemId(savedSystemId);
                setConnectionState("pending");
            }
        };
        init();
    }, []);

    // 2. Polling Logic for Pending State
    useEffect(() => {
        if (connectionState !== "pending" || !systemId) return;

        const checkStatus = async () => {
            try {
                // Adjust to your actual backend URL/port
                const res = await fetch(`http://127.0.0.1:8000/api/v1/organizations/systems/${systemId}/status`);
                if (!res.ok) {
                    if (res.status === 404) {
                        // System was deleted/rejected
                        setConnectionState("error");
                        setError("Your connection request was rejected or the system does not exist.");
                        const store = await getStore();
                        await store.set("systemId", "");
                        await store.save();
                    }
                    return;
                }

                const data = await res.json();
                if (data.status === "APPROVED") {
                    const store = await getStore();
                    await store.set("secretToken", data.secretToken);
                    await store.save();
                    setConnectionState("approved");
                    
                    // Proceed to dashboard or next parameter
                    setTimeout(() => {
                        router.push(nextParam || "/dashboard");
                    }, 1500);
                } else if (data.status === "REJECTED" || data.status === "REVOKED") {
                    setConnectionState("error");
                    setError(`Your request was ${data.status.toLowerCase()}.`);
                    const store = await getStore();
                    await store.set("systemId", "");
                    await store.save();
                }
            } catch (err) {
                console.error("Failed to poll status", err);
            }
        };

        checkStatus(); // Check immediately
        const interval = setInterval(checkStatus, 10000); // Check every 10 seconds

        return () => clearInterval(interval);
    }, [connectionState, systemId, router, nextParam]);

    // 3. User submits connection request
    const onSubmit = (values: OrganizationConnectValues) => {
        setError(null)
        setConnectionState("idle")

        startTransition(async () => {
            try {
                const res = await fetch("http://127.0.0.1:8000/api/v1/organizations/connect-system", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(values)
                });

                const data = await res.json();
                if (!res.ok) {
                    setError(data.detail || "Failed to connect. Please check your details.");
                    return;
                }

                if (data.success && data.systemId) {
                    const store = await getStore();
                    await store.set("systemId", data.systemId);
                    await store.save();

                    setSystemId(data.systemId);
                    setConnectionState("pending");
                }
            } catch (err) {
                console.error("Connection error:", err);
                setError("An unexpected error occurred indicating the backend server might be unreachable.");
            }
        })
    }

    if (connectionState === "approved") {
        return (
            <Card className="w-full border-none ring-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2 text-center py-12">
                <CardContent className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                        <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold">Connection Approved!</h2>
                        <p className="text-sm text-muted-foreground">Redirecting to your dashboard...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (connectionState === "pending") {
        return (
            <Card className="w-full border-none ring-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2 text-center py-12">
                <CardContent className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-muted flex items-center justify-center">
                            <Spinner className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold">Waiting for Approval</h2>
                        <p className="text-sm text-muted-foreground w-64 mx-auto">
                            Your system connection request has been sent. Please wait for an administrator to approve it.
                        </p>
                    </div>
                    <Button variant="outline" className="mt-4" onClick={() => {
                        setConnectionState("idle");
                        setSystemId(null);
                        getStore().then(s => s.set("systemId", "").then(() => s.save()));
                    }}>
                        Cancel Request
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full border-none ring-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2">
            <CardHeader className="text-center pt-0 md:pt-6 px-0 md:px-6">
                <CardTitle className="text-2xl font-bold">Connect Organisation</CardTitle>
                <CardDescription>Register your terminal using a secure organisation code to sync with the network.</CardDescription>
            </CardHeader>

            <CardContent className="px-0 space-y-4 md:px-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <HugeiconsIcon icon={Alert01Icon} className="w-4 h-4 text-destructive mb-1" />
                            <AlertDescription className="text-destructive">
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    <Field>
                        <FieldLabel htmlFor="organizationCode">Organisation Code</FieldLabel>
                        <Input
                            id="organizationCode"
                            placeholder="e.g. ORG-123456"
                            type="text"
                            disabled={isPending}
                            {...register("organizationCode")}
                        />
                        <FieldError errors={[{ message: errors.organizationCode?.message }]} />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="systemName">System Name</FieldLabel>
                        <Input
                            id="systemName"
                            placeholder="e.g. Reception Terminal 1"
                            type="text"
                            disabled={isPending}
                            {...register("systemName")}
                        />
                        <FieldError errors={[{ message: errors.systemName?.message }]} />
                    </Field>

                    <Button type="submit" className="w-full mt-2" disabled={isPending}>
                        {isPending && <Spinner className="h-4 w-4 mr-2" />}
                        {isPending ? "Connecting..." : "Request Connection"}
                    </Button>
                </form>
            </CardContent>

            <CardFooter className="flex justify-center border-t border-border/50 pb-4 px-0 md:px-6 pt-4 mt-2">
                <p className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href={`/auth/signup${nextParam ? `?next=${encodeURIComponent(nextParam)}` : ''}`} className="text-primary font-medium hover:underline">
                        Create Organisation
                    </Link>
                </p>
            </CardFooter>
        </Card>
    )
}

export default function OrganizationPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><Spinner /></div>}>
            <OrganizationConnectForm />
        </Suspense>
    )
}
