"use client"

import { ReactNode } from "react"
import { AuthGuard } from "@/components/shared/auth-guard"

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <AuthGuard requireOrganization={true}>
            {children}
        </AuthGuard>
    )
}
