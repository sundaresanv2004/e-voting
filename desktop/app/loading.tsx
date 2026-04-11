"use client"

import { LoadingScreen } from "@/components/shared/loading-screen"
import SetTheme from "@/components/shared/setTheme"

export default function GlobalLoading() {
    return (
        <>
            <div className="absolute top-4 right-4 z-50">
                <SetTheme />
            </div>
            <LoadingScreen />
        </>
    )
}
