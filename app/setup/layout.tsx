"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ThemeSwitch } from "@/components/shared/theme-switch"
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect"
import { useSession, signOut } from "@/lib/auth-client"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import { Logout01Icon, LayoutBottomIcon, UserIcon } from "@hugeicons/core-free-icons"

export default function SetupLayout({ children }: { children: ReactNode }) {
    const router = useRouter()
    const { data: session, isPending } = useSession()

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-4 pt-20 md:p-8 relative overflow-hidden bg-linear-to-b from-blue-50/30 via-background to-background dark:from-blue-950/20 dark:via-background dark:to-background w-full">
            {/* Header / Nav */}
            <div className="absolute top-4 left-4 right-4 z-50 flex justify-end items-center pointer-events-none">
                <div className="flex items-center gap-2 pointer-events-auto">
                    {isPending ? (
                        <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                    ) : session ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger className="outline-none">
                                <Avatar className="h-8 w-8 cursor-pointer ring-offset-background transition-colors hover:ring-2 hover:ring-ring">
                                    <AvatarImage src={session.user.image || ""} />
                                    <AvatarFallback className="text-xs">{session.user.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel className="flex flex-col space-y-1 font-normal min-w-0">
                                    <p className="text-sm font-medium leading-none truncate">{session.user.name}</p>
                                    <p className="text-xs leading-none text-muted-foreground truncate">{session.user.email}</p>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/organisation" className="cursor-pointer w-full">
                                        <HugeiconsIcon icon={LayoutBottomIcon} strokeWidth={2} />
                                        Dashboard
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/user/profile" className="cursor-pointer w-full">
                                        <HugeiconsIcon icon={UserIcon} strokeWidth={2} />
                                        Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => signOut({
                                        fetchOptions: {
                                            onSuccess: () => {
                                                toast.success("Logged out successfully")
                                                router.push("/")
                                            }
                                        }
                                    })}
                                    className="focus:bg-destructive focus:text-destructive-foreground cursor-pointer group"
                                >
                                    <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : null}
                    <div className="w-px h-6 bg-border mx-1" />
                    <ThemeSwitch />
                </div>
            </div>

            {/* Hero Background Pattern */}
            <div
                className="absolute inset-0 opacity-80 dark:opacity-60"
                style={{
                    maskImage:
                        "radial-gradient(ellipse 120% 80% at 50% 30%, black 0%, black 20%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.25) 75%, rgba(0,0,0,0.1) 88%, transparent 100%)",
                    WebkitMaskImage:
                        "radial-gradient(ellipse 120% 80% at 50% 30%, black 0%, black 20%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.25) 75%, rgba(0,0,0,0.1) 88%, transparent 100%)",
                }}
            >
                <div className="hidden dark:block absolute inset-0">
                    <BackgroundRippleEffect rows={20} cols={60} cellSize={60} />
                </div>
                <div className="block dark:hidden absolute inset-0">
                    <BackgroundRippleEffect rows={20} cols={60} cellSize={60} />
                </div>
            </div>

            {/* Fading bottom gradient */}
            <div className="absolute inset-0 pointer-events-none bg-linear-to-t from-background via-transparent to-transparent opacity-60 dark:opacity-70" />

            {/* Fading top gradient */}
            <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-blue-100/20 via-transparent to-transparent opacity-20 dark:from-blue-900/10 dark:opacity-30" />

            {/* Ambient blue background glow */}
            <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-20 bg-linear-to-br from-blue-500/5 via-transparent to-blue-400/5" />

            {/* Radial ambient glow at top center */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none opacity-10 dark:opacity-10 rounded-full bg-blue-400/20 blur-3xl" />

            {/* Content Container */}
            <div className="w-full max-w-lg relative z-10 flex-1 flex flex-col justify-center mt-8">
                <div className="w-full">
                    {children}
                </div>
            </div>
        </div>
    )
}
