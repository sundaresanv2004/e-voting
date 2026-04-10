"use client"

import { ReactNode } from "react"
import { AuthGuard } from "@/components/shared/auth-guard"

export default function UserLayout({ children }: { children: ReactNode }) {
    return (
        // Protects the /user directory
        <AuthGuard>
            {children}
        </AuthGuard>
    )
}
