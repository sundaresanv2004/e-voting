"use client"

import { ReactNode } from "react"
import { AuthGuard } from "@/components/shared/auth-guard"

export default function SetupLayout({ children }: { children: ReactNode }) {
    return (
        <AuthGuard>
            {children}
        </AuthGuard>
    )
}
