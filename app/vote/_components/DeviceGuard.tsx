"use client"

import React from "react"
import { useDeviceCheck } from "@/hooks/use-device-check"
import { HugeiconsIcon } from "@hugeicons/react"
import { LaptopProgrammingIcon } from "@hugeicons/core-free-icons"
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect"

export function DeviceGuard({ children }: { children: React.ReactNode }) {
    const { isDesktop } = useDeviceCheck()

    // On server (SSR), isDesktop defaults to true to avoid hydration mismatch
    // On client mount, it will immediately evaluate and render the guard if needed
    const [mounted, setMounted] = React.useState(false)
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <>{children}</>
    }

    if (!isDesktop) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-primary/20 text-center">
                <div className="absolute inset-0 opacity-50 pointer-events-none" style={{
                    maskImage: "radial-gradient(ellipse 140% 100% at 50% 50%, black 0%, black 30%, rgba(0,0,0,0.5) 60%, transparent 100%)",
                    WebkitMaskImage: "radial-gradient(ellipse 140% 100% at 50% 50%, black 0%, black 30%, rgba(0,0,0,0.5) 60%, transparent 100%)",
                }}>
                    <BackgroundRippleEffect rows={8} cols={12} cellSize={60} />
                </div>
                
                <div className="z-10 flex flex-col items-center max-w-md space-y-6">
                    <div className="p-4 rounded-3xl bg-primary/10 text-primary">
                        <HugeiconsIcon icon={LaptopProgrammingIcon} className="w-12 h-12" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black font-heading text-foreground tracking-tight">
                            Desktop Required
                        </h1>
                        <p className="text-muted-foreground leading-relaxed">
                            For security and optimal experience, the voting portal is only accessible on desktop and laptop computers. 
                            Please switch to a larger device to cast your ballot.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
