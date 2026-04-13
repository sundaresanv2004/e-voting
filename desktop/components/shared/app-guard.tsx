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
        const systemId = await secureGet("systemId");
        let systemStatus = await plainGet<string>("systemStatus");

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

        // 1. Unregistered (No System ID)
        if (!systemId) {
            if (PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/auth") || pathname.startsWith("/loading-demo")) {
                setIsChecking(false);
                return;
            }
            router.replace("/");
            setIsChecking(false);
            return;
        }

        // 2. Negative States (Do not network verify, stay locally disabled)
        if (systemStatus === "REJECTED" || systemStatus === "REVOKED" || systemStatus === "SUSPENDED") {
            if (PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/auth") || pathname.startsWith("/loading-demo")) {
                setIsChecking(false);
                return;
            }
            router.replace("/");
            setIsChecking(false);
            return;
        }

        // 3. Waiting States (Rely on pending page's polling)
        if (systemStatus === "PENDING" || systemStatus === "EXPIRED") {
            if (pathname !== PENDING_ROUTE) {
                router.replace(PENDING_ROUTE);
            }
            setIsChecking(false);
            return;
        }

        // 4. Active State (Deep verification)
        if (systemStatus === "APPROVED") {
            if (!secretToken) {
                if (pathname !== PENDING_ROUTE) {
                    router.replace(PENDING_ROUTE);
                }
                setIsChecking(false);
                return;
            }

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
                    if (vData.valid) {
                        // Sync data locally
                        if (vData.systemName) await plainSave("systemName", vData.systemName);
                        if (vData.organizationName) await plainSave("organizationName", vData.organizationName);
                        if (vData.organizationLogo) await plainSave("organizationLogo", vData.organizationLogo);

                        if (pathname.startsWith("/auth") || pathname === PENDING_ROUTE) {
                            router.replace("/");
                        }
                        setIsChecking(false);
                        return;
                    } else {
                        // Invalid. Update status locally.
                        const newStatus = vData.status;
                        await plainSave("systemStatus", newStatus);
                        
                        if (newStatus === "EXPIRED") {
                            await secureDelete("secretToken");
                            toast.error("Session expired. Re-approval required.");
                            router.replace(PENDING_ROUTE);
                        } else if (newStatus === "REJECTED" || newStatus === "REVOKED" || newStatus === "SUSPENDED") {
                            toast.error(`Terminal has been ${newStatus.toLowerCase()}.`);
                            router.replace("/");
                        } else {
                            // NOT_FOUND or MAC_MISMATCH, consider it revoked
                            await plainSave("systemStatus", "REVOKED");
                            toast.error(`Security verification failed: ${vData.message}`);
                            router.replace("/");
                        }
                        setIsChecking(false);
                        return;
                    }
                } 
            } catch (e) {
                console.error("Deep verification failed", e);
            }
            
            // Fallback for valid states after a network/app error
            if (pathname.startsWith("/auth") || pathname === PENDING_ROUTE) {
                router.replace("/");
            }
            setIsChecking(false);
            return;
        }

        // 5. Fallback catch-all
        if (PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/auth")) {
            setIsChecking(false);
            return;
        }
        router.replace("/");
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
