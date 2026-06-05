import { useState, useEffect } from "react"

export function useDeviceCheck() {
    // Default to true for SSR to avoid hydration mismatch, then verify on mount
    const [isDesktop, setIsDesktop] = useState(true)

    useEffect(() => {
        const checkDevice = () => {
            // 1024px is the standard breakpoint for large screens (lg in Tailwind)
            setIsDesktop(window.innerWidth >= 1024)
        }

        // Check initially
        checkDevice()

        // Re-check on resize
        window.addEventListener("resize", checkDevice)
        return () => window.removeEventListener("resize", checkDevice)
    }, [])

    return { isDesktop }
}
