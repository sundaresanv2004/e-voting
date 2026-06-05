"use client";

import { useEffect } from "react";

export function TabSessionManager() {
    useEffect(() => {
        let isUnloaded = false;

        const changeTabCount = (delta: number) => {
            const currentCount = parseInt(localStorage.getItem('e_voting_tab_count') || '0', 10);
            const newCount = Math.max(0, currentCount + delta);
            localStorage.setItem('e_voting_tab_count', newCount.toString());
            return newCount;
        };

        changeTabCount(1);

        const handleUnload = () => {
            if (isUnloaded) return;
            isUnloaded = true;
            const remaining = changeTabCount(-1);
            
            // If this was the absolute last tab open for the application, force a logout
            if (remaining === 0) {
                fetch('/api/auth/sign-out', { 
                    method: 'POST', 
                    keepalive: true,
                });
            }
        };

        window.addEventListener('beforeunload', handleUnload);
        
        return () => {
            handleUnload();
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, []);

    return null;
}
