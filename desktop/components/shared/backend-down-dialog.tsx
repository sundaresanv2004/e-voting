"use client"

import React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { CloudOffIcon, WifiError02Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogMedia,
} from "@/components/ui/alert-dialog"

import { openExternalUrl } from "@/lib/utils/external-url"

interface BackendDownDialogProps {
    isOpen: boolean
    onRetry: () => void
    type?: "backend" | "internet"
    isRetrying?: boolean
}

export function BackendDownDialog({ isOpen, onRetry, type = "backend", isRetrying = false }: BackendDownDialogProps) {
    const isInternet = type === "internet"

    const handleExit = async () => {
        try {
            // Close the Electron window properly
            window.close();
        } catch (e) {
            console.error("Failed to exit app", e);
        }
    }

    return (
        <AlertDialog open={isOpen}>
            <AlertDialogContent
                onEscapeKeyDown={(e) => e.preventDefault()}
                size="sm"
            >
                <AlertDialogHeader>
                    <AlertDialogMedia>
                        <HugeiconsIcon
                            icon={isInternet ? WifiError02Icon : CloudOffIcon}
                            className="w-8 h-8 text-destructive"
                        />
                    </AlertDialogMedia>
                    <AlertDialogTitle className="text-center">
                        {isInternet ? "No Internet Connection" : "Server Unreachable"}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-center">
                        {isInternet
                            ? "It looks like you're offline. Please check your Wi-Fi or mobile data and try again to continue."
                            : (
                                <>
                                    We cannot connect to the e-voting backend services. Please ensure the local server is running or{" "}
                                    <button
                                        onClick={() => openExternalUrl("mailto:contact@sundaresan.dev")}
                                        className="underline underline-offset-4 hover:text-foreground transition-colors cursor-pointer"
                                    >
                                        contact support
                                    </button>
                                    .
                                </>
                            )
                        }
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="sm:justify-center">
                    {isInternet ? (
                        <Button variant="outline" onClick={handleExit} disabled={isRetrying}>
                            Exit App
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={() => openExternalUrl("mailto:contact@sundaresan.dev")}
                            disabled={isRetrying}
                        >
                            Help
                        </Button>
                    )}
                    <AlertDialogAction onClick={onRetry} disabled={isRetrying}>
                        {isRetrying ? (
                            <>
                                <Spinner className="mr-2 h-4 w-4" />
                                Retrying...
                            </>
                        ) : (
                            "Retry"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
