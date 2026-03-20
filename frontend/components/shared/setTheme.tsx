"use client"

import { useTheme } from "next-themes"
import { HugeiconsIcon } from '@hugeicons/react';
import { Sun03Icon, Moon02Icon, LaptopIcon } from '@hugeicons/core-free-icons';

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function SetTheme() {
    const { setTheme } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative" suppressHydrationWarning>
                    {/* Sun Icon: Visible in light mode, rotates out in dark */}
                    <HugeiconsIcon icon={Sun03Icon}
                        className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
                    />

                    {/* Moon Icon: Invisible in light mode, rotates in for dark */}
                    <HugeiconsIcon icon={Moon02Icon}
                        className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
                    />

                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                    <HugeiconsIcon icon={Sun03Icon} strokeWidth={2} />
                    <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <HugeiconsIcon icon={Moon02Icon} strokeWidth={2} />
                    <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                    <HugeiconsIcon icon={LaptopIcon} strokeWidth={2} />
                    <span>System</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
