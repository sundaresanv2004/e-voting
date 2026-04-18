"use client"

import { useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"

export function SuccessToastListener() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const triggered = useRef<string | null>(null)

    useEffect(() => {
        const params = [
            "registered",
            "verified",
            "logged_in",
            "org_created",
            "reset_sent",
            "reset_success",
            "account_deleted",
            "left_org",
            "logged_out",
            "profile_updated",
            "password_changed",
            "avatar_updated",
            "avatar_removed",
        ]

        const errorParam = searchParams.get("error")
        if (errorParam === "logout_to_vote" && triggered.current !== "logout_to_vote") {
            toast.error("Please logout from the dashboard to cast a vote.")
            triggered.current = "logout_to_vote"
            const newSearchParams = new URLSearchParams(searchParams.toString())
            newSearchParams.delete("error")
            const newUrl = window.location.pathname + (newSearchParams.toString() ? `?${newSearchParams.toString()}` : "")
            router.replace(newUrl)
            return
        }

        for (const param of params) {
            if (searchParams.get(param) === "true" && triggered.current !== param) {
                switch (param) {
                    case "registered":
                        toast.success("Account created successfully")
                        break
                    case "verified":
                        toast.success("Email verified successfully")
                        break
                    case "logged_in":
                        toast.success("Logged in successfully")
                        break
                    case "org_created":
                        toast.success("Organization created successfully")
                        break
                    case "reset_sent":
                        toast.success("Reset link sent successfully")
                        break
                    case "reset_success":
                        toast.success("Password reset successfully")
                        break
                    case "left_org":
                        toast.success("Left organization successfully")
                        break
                    case "account_deleted":
                        toast.success("Account deleted successfully")
                        break
                    case "logged_out":
                        toast.success("Logged out successfully")
                        break
                    case "profile_updated":
                        toast.success("Profile updated successfully")
                        break
                    case "password_changed":
                        toast.success("Password updated successfully")
                        break
                    case "avatar_updated":
                        toast.success("Profile picture updated")
                        break
                    case "avatar_removed":
                        toast.success("Profile picture removed")
                        break
                }
                triggered.current = param

                // Clean up the URL after a small delay to ensure the toast has room to show
                const newSearchParams = new URLSearchParams(searchParams.toString())
                newSearchParams.delete(param)
                const newUrl = window.location.pathname + (newSearchParams.toString() ? `?${newSearchParams.toString()}` : "")
                router.replace(newUrl)
                break
            }
        }
    }, [searchParams, router])

    return null
}
