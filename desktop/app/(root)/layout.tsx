"use client"

import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SetTheme from "@/components/shared/setTheme";
import { HugeiconsIcon } from '@hugeicons/react';
import { Logout01Icon } from '@hugeicons/core-free-icons';
import { RootNavActions } from "./_components/nav-actions";
import { useAuth } from "@/components/providers/auth-provider";

export default function RootLayout({ children }: { children: ReactNode }) {
    const { user, isAuthenticated, logout } = useAuth();

    return (
        <div className="relative min-h-screen">
            <div className="absolute top-4 right-4 z-50 flex items-center gap-1 sm:gap-2">
                {isAuthenticated ? (
                    <>
                        <RootNavActions />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={logout}
                            className="text-destructive border-destructive/30 hover:border-destructive hover:bg-destructive/10 transition-colors"
                        >
                            <HugeiconsIcon icon={Logout01Icon} className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </Button>
                    </>
                ) : (
                    <>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/auth/login">Login</Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/auth/signup">Sign Up</Link>
                        </Button>
                    </>
                )}
                <div className="w-px h-6 bg-border mx-1 sm:mx-2" />
                <SetTheme />
            </div>
            {children}
        </div>
    );
}
