"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from '@hugeicons/react'
import { Home01Icon, Setup02Icon } from '@hugeicons/core-free-icons'
import { useAuth } from "@/components/providers/auth-provider"

export default function TempAdminPage() {
    const { user } = useAuth()

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                    <HugeiconsIcon icon={Setup02Icon} className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">Organization Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome {user?.name || user?.email}! This section is currently under development for the desktop app.
                    </p>
                </div>

                <div className="pt-4">
                    <Button asChild>
                        <Link href="/">
                            <HugeiconsIcon icon={Home01Icon} className="w-4 h-4 mr-2" />
                            Return to Home
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
