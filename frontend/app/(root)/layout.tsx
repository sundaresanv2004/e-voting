import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SetTheme from "@/components/shared/setTheme";
import { HugeiconsIcon } from '@hugeicons/react';
import { Layout01Icon, Logout01Icon, UserIcon } from '@hugeicons/core-free-icons';

import { auth } from "@/auth";
import { RootNavActions } from "./_components/nav-actions";
import { LogoutButton } from "@/components/shared/logout-button";

export default async function RootLayout({ children }: { children: ReactNode }) {
    const session = await auth();

    return (
        <div className="relative min-h-screen">
            <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
                {session?.user ? (
                    <>
                        <RootNavActions />
                        <LogoutButton />
                    </>
                ) : (
                    <>
                        <Link href="/auth/login">
                            <Button variant="ghost" size="sm">
                                Login
                            </Button>
                        </Link>
                        <Link href="/auth/signup">
                            <Button variant="outline" size="sm">
                                Sign Up
                            </Button>
                        </Link>
                    </>
                )}
                <div className="w-px h-6 bg-border mx-2" />
                <SetTheme />
            </div>
            {children}
        </div>
    );
}
