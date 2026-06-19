"use client"

import Link from "next/link"
import { useSession, signOut } from "@/lib/auth-client"
import { toast } from "sonner"
import { useTheme } from "next-themes"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UnfoldMoreIcon,
  UserIcon,
  Settings01Icon,
  LogoutIcon,
  Sun03Icon,
  Moon02Icon,
  LaptopIcon,
  PaintBrushIcon,
  Message01Icon,
  HelpCircleIcon
} from "@hugeicons/core-free-icons"

export function NavUser({
  user: _user, // Allow fallback if session is not yet loaded, but primarily use session
}: {
  user?: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const { data: session } = useSession()
  const { setTheme } = useTheme()

  const user = {
    name: session?.user?.name || _user?.name || "User",
    email: session?.user?.email || _user?.email || "",
    avatar: session?.user?.image || _user?.avatar || "",
  }

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar || undefined} alt={user.name} />
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <HugeiconsIcon icon={UnfoldMoreIcon} strokeWidth={2} className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar || undefined} alt={user.name} />
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/user/profile" className="cursor-pointer">
                  <HugeiconsIcon icon={UserIcon} strokeWidth={2} />
                  My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <HugeiconsIcon icon={PaintBrushIcon} strokeWidth={2} />
                  Appearance
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer">
                    <HugeiconsIcon icon={Sun03Icon} strokeWidth={2} />
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer">
                    <HugeiconsIcon icon={Moon02Icon} strokeWidth={2} />
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer">
                    <HugeiconsIcon icon={LaptopIcon} strokeWidth={2} />
                    System
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild className="cursor-pointer">
                {process.env.NEXT_PUBLIC_CONTACT_MAIL ? (
                  <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_MAIL}`}>
                    <HugeiconsIcon icon={Message01Icon} strokeWidth={2} />
                    Feedback & Suggestion
                  </a>
                ) : (
                  <span className="text-muted-foreground/40 cursor-not-allowed">
                    <HugeiconsIcon icon={Message01Icon} strokeWidth={2} />
                    no contact is given
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                {process.env.NEXT_PUBLIC_CONTACT_MAIL ? (
                  <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_MAIL}`}>
                    <HugeiconsIcon icon={HelpCircleIcon} strokeWidth={2} />
                    Contact Support
                  </a>
                ) : (
                  <span className="text-muted-foreground/40 cursor-not-allowed">
                    <HugeiconsIcon icon={HelpCircleIcon} strokeWidth={2} />
                    no contact is given
                  </span>
                )}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="focus:bg-destructive focus:text-destructive-foreground cursor-pointer group"
              onSelect={async (e) => {
                e.preventDefault();
                await signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      toast.success("Logged out successfully")
                      window.location.href = "/?logged_out=true"
                    }
                  }
                })
              }}
            >
              <HugeiconsIcon icon={LogoutIcon} strokeWidth={2} className="group-focus:text-destructive-foreground transition-colors" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
