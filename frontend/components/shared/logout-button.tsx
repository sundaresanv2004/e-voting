"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Logout01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

interface LogoutButtonProps {
  className?: string
  variant?: "outline" | "ghost" | "destructive" | "default" | "secondary" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  showIcon?: boolean
}

export function LogoutButton({
  className,
  variant = "outline",
  size = "sm",
  showIcon = true
}: LogoutButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={async () => {
        await signOut({ redirect: false })
        window.location.href = "/?logged_out=true"
      }}
      className={cn(
        variant === "outline" && "text-destructive border-destructive/30 hover:border-destructive hover:bg-destructive/10",
        className
      )}
    >
      {showIcon && <HugeiconsIcon icon={Logout01Icon} className="w-4 h-4" />}
      Logout
    </Button>
  )
}
