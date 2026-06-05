"use client"

import { useEffect, useRef } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"

export function SettingsToastListener() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()
    const triggered = useRef<string | null>(null)

    useEffect(() => {
        const profileUpdated = searchParams.get("profile_updated")
        const passwordChanged = searchParams.get("password_changed")
        const avatarUpdated = searchParams.get("avatar_updated")
        const avatarRemoved = searchParams.get("avatar_removed")
        const leftOrg = searchParams.get("left_org")

        let currentFlag = ""
        let message = ""

        if (profileUpdated === "true") {
            currentFlag = "profile_updated"
            message = "Profile updated successfully"
        } else if (passwordChanged === "true") {
            currentFlag = "password_changed"
            message = "Password updated successfully"
        } else if (avatarUpdated === "true") {
            currentFlag = "avatar_updated"
            message = "Profile picture updated"
        } else if (avatarRemoved === "true") {
            currentFlag = "avatar_removed"
            message = "Profile picture removed"
        } else if (leftOrg === "true") {
            currentFlag = "left_org"
            message = "Left organization successfully"
        }

        if (currentFlag && triggered.current !== currentFlag) {
            triggered.current = currentFlag
            toast.success(message)

            // Clean up the URL
            const params = new URLSearchParams(searchParams)
            params.delete(currentFlag)
            
            const queryString = params.toString()
            const cleanPath = queryString ? `${pathname}?${queryString}` : pathname
            
            router.replace(cleanPath)
        }
    }, [searchParams, router, pathname])

    return null
}
