"use client"

import React from "react"
import { HugeiconsIcon } from '@hugeicons/react'
import { Shield01Icon } from '@hugeicons/core-free-icons'
import { Spinner } from "@/components/ui/spinner"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
    AlertDialogOverlay,
    AlertDialogPortal,
} from '@/components/ui/alert-dialog'
import { BackendDownDialog } from './backend-down-dialog'

interface GlobalLoaderProps {
    status: 'loading' | 'error' | 'verifying'
    onRetry?: () => void
    networkErrorType?: "backend" | "internet"
    isRetrying?: boolean
}

export function GlobalLoader({ status, onRetry, networkErrorType = "backend", isRetrying = false }: GlobalLoaderProps) {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    if (status === 'error') {
        return (
            <BackendDownDialog
                isOpen={true}
                onRetry={onRetry || (() => { })}
                type={networkErrorType}
                isRetrying={isRetrying}
            />
        )
    }

    return (
        <AlertDialog open={true}>
            <AlertDialogPortal>
                <AlertDialogOverlay className="bg-black/20 backdrop-blur-md" />
                <AlertDialogContent
                    onEscapeKeyDown={(e) => e.preventDefault()}
                    size="sm"
                >
                    <AlertDialogHeader>
                        <AlertDialogMedia>
                            <div className="relative flex items-center justify-center">
                                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                                    <HugeiconsIcon icon={Shield01Icon} className="w-7 h-7 text-primary" />
                                </div>
                                <Spinner className="absolute -top-1 -right-1 h-5 w-5 text-primary" />
                            </div>
                        </AlertDialogMedia>
                        <AlertDialogTitle>Securing your session</AlertDialogTitle>
                        <AlertDialogDescription>
                            {status === 'loading' && "Connecting to the secure e-voting server..."}
                            {status === 'verifying' && "Verifying terminal identity..."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                </AlertDialogContent>
            </AlertDialogPortal>
        </AlertDialog>
    )
}
