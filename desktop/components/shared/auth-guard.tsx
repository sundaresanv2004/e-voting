"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { Spinner } from "@/components/ui/spinner"

/**
 * AuthGuard — client-side route protection replacing Next.js middleware (proxy.ts).
 * 
 * Since Tauri uses static export, middleware is not available.
 * This component replicates the proxy.ts routing logic on the client.
 * 
 * Wrap this around protected layouts to enforce authentication.
 */
interface AuthGuardProps {
    children: React.ReactNode
    /** If true, requires the user to have an organizationId */
    requireOrganization?: boolean
}

export function AuthGuard({ children, requireOrganization = false }: AuthGuardProps) {
    const { user, isLoading, isAuthenticated } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (isLoading) return

        // Not authenticated → redirect to login
        if (!isAuthenticated) {
            router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`)
            return
        }

        // Authenticated but needs organization setup
        if (requireOrganization && !user?.organizationId) {
            if (!pathname.startsWith("/setup")) {
                router.replace("/setup/organization")
            }
            return
        }

        // Has organization but is on setup page → redirect to dashboard
        if (user?.organizationId && pathname.startsWith("/setup")) {
            router.replace("/admin/organization")
            return
        }
    }, [isLoading, isAuthenticated, user, pathname, router, requireOrganization])

    // Show loading state while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Spinner className="h-8 w-8" />
                    <p className="text-sm text-muted-foreground animate-pulse">
                        Authenticating...
                    </p>
                </div>
            </div>
        )
    }

    // Not authenticated — render nothing while redirect happens
    if (!isAuthenticated) {
        return null
    }

    // Needs org but doesn't have one and not on setup page
    if (requireOrganization && !user?.organizationId && !pathname.startsWith("/setup")) {
        return null
    }

    return <>{children}</>
}

/**
 * GuestGuard — prevents authenticated users from accessing auth pages.
 * Use this on login/signup layouts.
 */
export function GuestGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading, isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (isLoading) return

        if (isAuthenticated) {
            // Redirect authenticated users away from auth pages
            const redirectUrl = user?.organizationId
                ? "/admin/organization"
                : "/setup/organization"
            router.replace(redirectUrl)
        }
    }, [isLoading, isAuthenticated, user, router])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Spinner className="h-8 w-8" />
                </div>
            </div>
        )
    }

    if (isAuthenticated) {
        return null
    }

    return <>{children}</>
}
