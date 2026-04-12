"use client"

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

// Constants for routes
const PUBLIC_ROUTES = ["/", "/loading-demo"]; // Home and demo are public
const AUTH_ROUTES = ["/auth/connect"];
const PENDING_ROUTE = "/pending";
const PRIVATE_BASE = "/";

import { secureGet, secureReset, secureDelete, plainGet, plainDelete, plainSave, plainClear } from "@/lib/utils/secure-storage";
import { toast } from "sonner";

import { BackendDownDialog } from "./backend-down-dialog";

export function AppGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);
    const [isRetrying, setIsRetrying] = useState(false);
    const [connectivityError, setConnectivityError] = useState<"backend" | "internet" | null>(null);

    const checkBackendHealth = async () => {
        // ... (keeping health check logic) ...
        if (typeof window !== "undefined" && !window.navigator.onLine) {
            setConnectivityError("internet");
            return false;
        }

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
            const res = await fetch(`${apiUrl}/api/v1/health`, { cache: 'no-store' });
            if (res.ok) {
                setConnectivityError(null);
                return true;
            }
            setConnectivityError("backend");
            return false;
        } catch (e) {
            if (typeof window !== "undefined" && window.navigator.onLine) {
                try {
                    await fetch("https://1.1.1.1", { mode: 'no-cors', cache: 'no-store' });
                    setConnectivityError("backend");
                } catch (err) {
                    setConnectivityError("internet");
                }
            } else {
                setConnectivityError("internet");
            }
            return false;
        }
    };

    const checkNavigation = async () => {
        const isHealthy = await checkBackendHealth();
        if (!isHealthy) {
            setIsChecking(false);
            return;
        }

        const secretToken = await secureGet("secretToken");
        const tokenExists = !!secretToken;
        const systemId = await secureGet("systemId");
        let systemStatus = await plainGet<string>("systemStatus");

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

        // 1. FAST EXIT for Public/Auth routes when no system is registered
        if (!systemId && !tokenExists) {
            if (PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/auth") || pathname.startsWith("/loading-demo")) {
                setIsChecking(false);
                return;
            }
        }

        // 2. CLOUD TRUTH: If we have an ID, we MUST check the cloud status FIRST
        if (systemId) {
            try {
                const res = await fetch(`${apiUrl}/api/v1/organizations/systems/${systemId}/status`);
                if (res.status === 404) {
                    await secureReset();
                    router.replace("/auth/connect");
                    setIsChecking(false);
                    return;
                }

                const sData = await res.json();
                
                // Keep local status in sync with cloud
                if (sData.status !== systemStatus) {
                    await plainSave("systemStatus", sData.status);
                    systemStatus = sData.status;
                }

                // Handle Revoked/Rejected (Forbidden Paths)
                if (sData.status === "REVOKED" || sData.status === "REJECTED" || sData.status === "SUSPENDED") {
                    toast.error(`Terminal has been ${sData.status.toLowerCase()}.`);
                    await secureReset();
                    router.replace("/auth/connect");
                    setIsChecking(false);
                    return;
                }

                // Handle PENDING (Must go to pending page)
                if (sData.status === "PENDING") {
                    if (pathname !== PENDING_ROUTE) {
                        router.replace(PENDING_ROUTE);
                        setIsChecking(false);
                        return;
                    }
                }

                // Handle APPROVED (Check for token)
                if (sData.status === "APPROVED") {
                    if (!tokenExists) {
                        // We have no token locally but cloud says approved?
                        // Go to pending page so it can poll and securely retrieve/save the token
                        if (pathname !== PENDING_ROUTE) {
                            router.replace(PENDING_ROUTE);
                            setIsChecking(false);
                            return;
                        }
                    } else {
                        // We have a token! Now do Deep Verification (MAC + Expiry)
                        try {
                            let macAddress = null;
                            try {
                                const { invoke } = await import('@tauri-apps/api/core');
                                const sysInfo: any = await invoke('get_system_info');
                                macAddress = sysInfo.macAddress;
                            } catch (e) { /* ignore */ }

                            const vRes = await fetch(`${apiUrl}/api/v1/organizations/systems/verify`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ systemId, secretToken, macAddress })
                            });

                            if (vRes.ok) {
                                const vData = await vRes.json();
                                if (!vData.valid) {
                                    if (vData.status === "EXPIRED") {
                                        toast.error("Session expired. Re-approval required.");
                                        await plainSave("systemStatus", "EXPIRED");
                                        await secureDelete("secretToken");
                                        systemStatus = "EXPIRED";
                                        router.replace(PENDING_ROUTE);
                                        setIsChecking(false);
                                        return;
                                    } else {
                                        toast.error("Security verification failed.");
                                        await secureReset();
                                        router.replace("/auth/connect");
                                        setIsChecking(false);
                                        return;
                                    }
                                }
                            }
                        } catch (e) {
                            console.error("Deep verification failed", e);
                        }
                    }
                }
            } catch (e) {
                console.error("Cloud status check failed", e);
            }
        }

        // 3. Already on a safe route? Exit early
        if (PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/auth") || pathname.startsWith("/loading-demo")) {
            // If approved and verified, but on auth page, go to home
            if (tokenExists && systemStatus === "APPROVED" && (pathname.startsWith("/auth") || pathname === PENDING_ROUTE)) {
                router.replace("/");
                return;
            }
            setIsChecking(false);
            return;
        }

        // 4. Fallback Logic
        if (tokenExists && systemStatus === "APPROVED") {
            if (pathname === PENDING_ROUTE || pathname.startsWith("/auth")) {
                router.replace("/");
            }
        } else if (systemId && (systemStatus === "PENDING" || systemStatus === "APPROVED" || systemStatus === "EXPIRED")) {
            if (pathname !== PENDING_ROUTE) {
                router.replace(PENDING_ROUTE);
            }
        } else {
            router.replace("/auth/connect");
        }

        setIsChecking(false);
    };

    useEffect(() => {
        checkNavigation();
    }, [pathname, router]);

    const handleRetry = async () => {
        setIsRetrying(true);
        await checkNavigation();
        setIsRetrying(false);
    };

    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Spinner className="size-12 text-primary" />
            </div>
        );
    }

    return (
        <>
            <BackendDownDialog 
                isOpen={connectivityError !== null} 
                onRetry={handleRetry} 
                type={connectivityError || "backend"}
                isRetrying={isRetrying}
            />
            {children}
        </>
    );
}
