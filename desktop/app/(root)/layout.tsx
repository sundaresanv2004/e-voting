import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SetTheme from "@/components/shared/setTheme";
import { HugeiconsIcon } from '@hugeicons/react';
import { Layout01Icon } from '@hugeicons/core-free-icons';

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <div className="relative min-h-screen" suppressHydrationWarning>
            <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
                <SetTheme />
            </div>
            {children}
        </div>
    );
}
