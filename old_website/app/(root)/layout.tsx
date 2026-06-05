import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SetTheme from "@/components/shared/setTheme";

import { auth } from "@/auth";
import { RootNavActions } from "./_components/nav-actions";
import { LogoutButton } from "@/components/shared/logout-button";
import { HomeButton } from "@/components/shared/home-button";

export default async function RootLayout({ children }: { children: ReactNode }) {
    const session = await auth();

    return (
        <div className="relative min-h-screen">
            <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center pointer-events-none">
                <div className="pointer-events-auto">
                    <HomeButton />
                </div>
                <div className="flex items-center gap-2 pointer-events-auto">
                    {session?.user ? (
                        <>
                            <RootNavActions />
                            <LogoutButton />
                        </>
                    ) : (
                        <>
                            <Link href="/auth/login">
                                <Button variant="ghost">
                                    Login
                                </Button>
                            </Link>
                            <Link href="/auth/signup">
                                <Button variant="outline">
                                    Sign Up
                                </Button>
                            </Link>
                        </>
                    )}
                    <div className="w-px h-6 bg-border mx-2" />
                    <SetTheme />
                </div>
            </div>
            {children}
        </div>
    );
}
