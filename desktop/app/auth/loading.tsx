"use client"

import { LoadingScreen } from "@/components/shared/loading-screen"

export default function AuthLoading() {
    return <LoadingScreen title="Authenticating..." description="Please wait while we secure your session." />
}
