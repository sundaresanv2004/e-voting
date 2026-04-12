"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from '@hugeicons/react'
import { Logout01Icon } from '@hugeicons/core-free-icons'
import { secureGet, plainGet, secureReset } from "@/lib/utils/secure-storage"
import SetTheme from "@/components/shared/setTheme"

export function RootHeader() {
    const [isApproved, setIsApproved] = useState(false);

    useEffect(() => {
        const checkConnection = async () => {
            const status = await plainGet<string>("systemStatus");
            const token = await secureGet("secretToken");
            
            if (status === "APPROVED" && token) {
                setIsApproved(true);
            }
        };
        checkConnection();
    }, []);

    const handleLogout = async () => {
        try {
            const systemId = await secureGet("systemId");
            if (systemId) {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
                await fetch(`${apiUrl}/api/v1/organizations/systems/${systemId}/revoke`, {
                    method: 'POST'
                });
            }
        } catch (e) {
            console.error("Cloud logout fail", e);
        }
        await secureReset();
        window.location.reload();
    };

    return (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
            {isApproved && (
                <>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleLogout}
                        className="text-destructive border-destructive/30 hover:border-destructive hover:bg-destructive/10 transition-colors gap-2"
                    >
                        <HugeiconsIcon icon={Logout01Icon} className="w-4 h-4" />
                        Logout
                    </Button>
                    <div className="w-px h-6 bg-border mx-2" />
                </>
            )}
            <SetTheme />
        </div>
    );
}
