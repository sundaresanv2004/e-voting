import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SetTheme from "@/components/shared/setTheme";

export default async function RootLayout({ children }: { children: ReactNode }) {

    return (
        <div className="relative min-h-screen">
            <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
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
                <div className="w-px h-6 bg-border mx-2" />
                <SetTheme />
            </div>
            {children}
        </div>
    );
}
