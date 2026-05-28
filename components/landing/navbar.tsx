"use client"

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeSwitch } from "@/components/shared/theme-switch";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeftIcon } from "@hugeicons/core-free-icons";

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const isHomePage = pathname === "/";

    return (
        <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center pointer-events-none">
            {!isHomePage ? (
                <div className="pointer-events-auto">
                    <Button
                        variant="ghost"
                        className="gap-2 group"
                        onClick={() => router.back()}
                    >
                        <HugeiconsIcon
                            icon={ArrowLeftIcon}
                            className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200"
                            strokeWidth={2.5}
                        />
                        <span className="text-sm font-medium">Back</span>
                    </Button>
                </div>
            ) : (
                <div />
            )}
            <div className="flex items-center gap-2 pointer-events-auto">
                <Button variant="ghost" asChild>
                    <Link href="/auth/login">Login</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/auth/signup">Sign Up</Link>
                </Button>
                <div className="w-px h-6 bg-border mx-2" />
                <ThemeSwitch />
            </div>
        </div>
    );
}
