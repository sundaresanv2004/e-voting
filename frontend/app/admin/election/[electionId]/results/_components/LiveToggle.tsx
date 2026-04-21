"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export function LiveToggle() {
    const router = useRouter()
    const [isLive, setIsLive] = React.useState(false)
    const intervalRef = React.useRef<NodeJS.Timeout | null>(null)

    React.useEffect(() => {
        if (isLive) {
            intervalRef.current = setInterval(() => {
                router.refresh()
            }, 20000)
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [isLive, router])

    return (
        <div className="flex items-center gap-2.5">
            <Switch
                id="live-toggle"
                checked={isLive}
                onCheckedChange={setIsLive}
            />
            <Label
                htmlFor="live-toggle"
                className={cn(
                    "text-sm font-bold cursor-pointer select-none flex items-center gap-2 transition-colors",
                    isLive ? "text-emerald-600" : "text-muted-foreground"
                )}
            >
                {isLive && (
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                )}
                Live
            </Label>
        </div>
    )
}
