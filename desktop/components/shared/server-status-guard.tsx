"use client"

import React, { useEffect, useState, useCallback } from "react"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/lib/api"
import { HugeiconsIcon } from "@hugeicons/react"
import { WifiDisconnected04Icon } from "@hugeicons/core-free-icons"
import { LoadingScreen } from "@/components/shared/loading-screen"
import { ExternalLink } from "@/components/shared/external-link"

interface ServerStatusGuardProps {
    children: React.ReactNode
}

export function ServerStatusGuard({ children }: ServerStatusGuardProps) {
    const [isHealthy, setIsHealthy] = useState<boolean | null>(null)
    const [isChecking, setIsChecking] = useState(true)

    const checkHealth = useCallback(async () => {
        setIsChecking(true)
        try {
            const response = await api.get<{ status: string }>("/health/")
            setIsHealthy(response.status === "ok")
        } catch (error) {
            console.error("[HealthCheck] Failed to connect to server:", error)
            setIsHealthy(false)
        } finally {
            setIsChecking(false)
        }
    }, [])

    useEffect(() => {
        checkHealth()
    }, [checkHealth])

    // Block rendering until the initial check completes
    if (isChecking && isHealthy === null) {
        return <LoadingScreen title="Connecting to server..." description="Verifying backend availability." />
    }

    return (
        <>
            {children}

            <AlertDialog open={isHealthy === false}>
                <AlertDialogContent
                    onEscapeKeyDown={(e) => e.preventDefault()}
                >
                    <AlertDialogHeader>
                        <div className="flex items-center gap-2">
                            <HugeiconsIcon
                                icon={WifiDisconnected04Icon}
                                className="size-5 text-destructive"
                            />
                            <AlertDialogTitle>
                                Unable to Connect
                            </AlertDialogTitle>
                        </div>
                        <AlertDialogDescription>
                            We couldn&apos;t reach the voting server. Please
                            check your connection and try again. If the problem
                            continues, contact us.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                        <ExternalLink
                            href="mailto:contact@sundaresan.dev"
                            className="inline-flex hover:cursor-pointer items-center justify-center gap-2 rounded-4xl border border-border bg-input/30 px-4 py-2 text-sm font-medium hover:bg-input/50 transition-all w-full sm:w-auto"
                        >
                            Contact Us
                        </ExternalLink>
                        <AlertDialogAction
                            onClick={checkHealth}
                            disabled={isChecking}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold w-full sm:w-auto"
                        >
                            {isChecking && <Spinner className="size-4" />}
                            {isChecking ? "Retrying…" : "Retry Connection"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
