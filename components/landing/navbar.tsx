import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeSwitch } from "@/components/shared/theme-switch";

export function Navbar() {
    return (
        <div className="absolute top-4 left-4 right-4 z-50 flex justify-end items-center pointer-events-none">
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
