"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export type SystemStatus = "APPROVED" | "PENDING" | "REJECTED" | "REVOKED" | "UNREGISTERED" | "EXPIRED" | "INITIAL";

interface TerminalState {
    systemId: string | null;
    systemStatus: SystemStatus;
    systemName: string;
    organizationName: string;
    organizationLogo: string | null;
}

interface TerminalContextType {
    terminal: TerminalState;
    loading: boolean;
    refresh: () => Promise<void>;
}

const TerminalContext = createContext<TerminalContextType | undefined>(undefined);

import { GlobalLoader } from './global-loader';

export function TerminalProvider({ children }: { children: ReactNode }) {
    const [terminal, setTerminal] = useState<TerminalState>({
        systemId: null,
        systemStatus: "INITIAL",
        systemName: "",
        organizationName: "",
        organizationLogo: null,
    });
    const [loading, setLoading] = useState(true);
    const [networkError, setNetworkError] = useState<"backend" | "internet" | null>(null);
    const [isRetrying, setIsRetrying] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const hydrate = async () => {
        setLoading(true);
        setNetworkError(null);
        try {
            if (typeof window !== "undefined" && !window.navigator.onLine) {
                setNetworkError("internet");
                return;
            }

            const electron = (window as any).electron;
            if (!electron?.terminal) return;

            // Check if backend is reachable
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/health`, { method: 'GET', cache: 'no-store' });
                if (!response.ok) throw new Error("Server health check failed");
            } catch (err) {
                if (typeof window !== "undefined" && window.navigator.onLine) {
                    setNetworkError("backend");
                } else {
                    setNetworkError("internet");
                }
                return;
            }

            // Fetch identity immediately to prepare the UI
            const identity = await electron.terminal.getIdentity();

            // Run the actual backend verify handshake and WAIT for it
            const verifyResult = await electron.terminal.verifyHandshake();

            // Refetch identity in case the verify handshake updated cache data
            const freshIdentity = await electron.terminal.getIdentity();

            setTerminal({
                systemId: freshIdentity.systemId,
                systemStatus: verifyResult.status as SystemStatus,
                systemName: freshIdentity.systemName || "",
                organizationName: freshIdentity.organizationName || "",
                organizationLogo: freshIdentity.organizationLogo || null,
            });
        } catch (e) {
            console.error("Failed to hydrate terminal state:", e);
            if (!networkError) setNetworkError("backend");
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = async () => {
        setIsRetrying(true);
        await hydrate();
        setIsRetrying(false);
    };

    useEffect(() => {
        hydrate();

        const electron = (window as any).electron;
        if (electron?.terminal?.onStatusUpdate) {
            const unsub = electron.terminal.onStatusUpdate((newStatus: SystemStatus) => {
                setTerminal(prev => ({ ...prev, systemStatus: newStatus }));
            });
            return () => {
                if (unsub) unsub();
            }
        }
    }, []);

    // Global Routing Guard Helper
    useEffect(() => {
        if (loading || networkError) return;

        const isAuthPage = pathname.startsWith('/auth');
        const isHomePage = pathname === '/';
        const isVerifyPage = pathname.startsWith('/verify');
        
        if (terminal.systemStatus === "UNREGISTERED") {
            if (!isAuthPage && !isHomePage) {
                router.replace('/auth/connect');
            }
            return;
        } else if (terminal.systemStatus === "REVOKED" && pathname !== '/verify/revoked') {
            router.replace('/verify/revoked');
        } else if (terminal.systemStatus === "EXPIRED" && pathname !== '/verify/expired') {
            router.replace('/verify/expired');
        } else if ((terminal.systemStatus === "PENDING" || terminal.systemStatus === "REJECTED") && pathname !== '/verify/pending') {
            router.replace('/verify/pending');
        } else if (terminal.systemStatus === "APPROVED") {
            const isConnectPage = pathname === '/auth/connect';
            if (isConnectPage || isHomePage || isVerifyPage) {
                router.replace('/dashboard');
            }
        }
    }, [terminal.systemStatus, pathname, loading, networkError, router]);

    return (
        <TerminalContext.Provider value={{
            terminal,
            loading,
            refresh: hydrate,
        }}>
            {loading && !networkError && <GlobalLoader status={terminal.systemId ? 'verifying' : 'loading'} />}
            {networkError && (
                <GlobalLoader 
                    status="error" 
                    onRetry={handleRetry} 
                    networkErrorType={networkError} 
                    isRetrying={isRetrying} 
                />
            )}
            {children}
        </TerminalContext.Provider>
    );
}

export function useTerminal() {
    const context = useContext(TerminalContext);
    if (context === undefined) {
        throw new Error('useTerminal must be used within a TerminalProvider');
    }
    return context;
}
