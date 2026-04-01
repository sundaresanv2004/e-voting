import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SetTheme from "@/components/shared/setTheme";
import { HugeiconsIcon } from '@hugeicons/react';
import { Layout01Icon, Logout01Icon } from '@hugeicons/core-free-icons';

import { auth, signOut } from "@/auth";

export default async function RootLayout({ children }: { children: ReactNode }) {
    const session = await auth();

    return (
        <div className="relative min-h-screen">
            <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
                {session?.user ? (
                    <>
                        <Link href="/admin/organization">
                            <Button variant="default" size="sm">
                                <HugeiconsIcon icon={Layout01Icon} className="w-4 h-4" />
                                Dashboard
                            </Button>
                        </Link>
                        <form action={async () => {
                            "use server"
                            await signOut({ redirectTo: "/" })
                        }}>
                            <Button
                                variant="outline"
                                size="sm"
                                type="submit"
                                className="text-destructive border-destructive/30 hover:border-destructive hover:bg-destructive/10 transition-colors"
                            >
                                <HugeiconsIcon icon={Logout01Icon} className="w-4 h-4" />
                                Logout
                            </Button>
                        </form>
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
