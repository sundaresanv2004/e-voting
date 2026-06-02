"use client"

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeSwitch } from "@/components/shared/theme-switch";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeftIcon, LayoutBottomIcon, UserIcon, Logout01Icon } from "@hugeicons/core-free-icons";
import { useSession, signOut } from "@/lib/auth-client";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const isHomePage = pathname === "/";
    const { data: session, isPending } = useSession();

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
                {isPending ? (
                    <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                ) : session ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger className="outline-none">
                            <Avatar>
                                <AvatarImage src={session.user.image || ""} />
                                <AvatarFallback>{session.user.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
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
                                            toast.success("Logged out successfully");
                                            router.push("/");
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
                ) : (
                    <>
                        <Button variant="ghost" asChild>
                            <Link href="/auth/login">Login</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/auth/signup">Sign Up</Link>
                        </Button>
                    </>
                )}
                <div className="w-px h-6 bg-border mx-2" />
                <ThemeSwitch />
            </div>
        </div>
    );
}
