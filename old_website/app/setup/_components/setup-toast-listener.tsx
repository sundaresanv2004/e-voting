"use client"

import { useEffect, useRef } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"

export function SetupToastListener() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()
    const triggered = useRef<string | null>(null)

    useEffect(() => {
        const loggedIn = searchParams.get("logged_in")
        
        if (loggedIn === "true" && triggered.current !== "logged_in") {
            triggered.current = "logged_in"
            toast.success("Logged in successfully")

            // Clean up the URL
            const params = new URLSearchParams(searchParams)
            params.delete("logged_in")
            
            const queryString = params.toString()
            const cleanPath = queryString ? `${pathname}?${queryString}` : pathname
            
            router.replace(cleanPath)
        }
    }, [searchParams, router, pathname])

    return null
}
