import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SetTheme from "@/components/shared/setTheme";
import { createClient } from "@/lib/supabase/server";
import { LogOut, LayoutDashboard } from "lucide-react";
import { signOut } from "@/app/auth/actions";

export default async function RootLayout({ children }: { children: ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="relative min-h-screen">
            <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
                {user ? (
                    // Logged in - Show Dashboard and Logout
                    <>
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm" className="gap-2">
                                <LayoutDashboard size={16} />
                                Dashboard
                            </Button>
                        </Link>
                        <form action={async () => {
                            'use server'
                            await signOut()
                        }} className="inline">
                            <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/20 border-red-200 dark:border-red-900/50" type="submit">
                                <LogOut size={16} />
                                Logout
                            </Button>
                        </form>
                    </>
                ) : (
                    // Not logged in - Show Login and Sign Up
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
