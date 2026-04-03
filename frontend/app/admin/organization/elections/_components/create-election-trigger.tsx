"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { ElectionDialog } from "./election-dialog"

interface CreateElectionTriggerProps {
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  showText?: boolean
  listenToParams?: boolean
}

export function CreateElectionTrigger({
  variant = "default",
  size = "default",
  className,
  showText = true,
  listenToParams = false,
}: CreateElectionTriggerProps) {
  const [open, setOpen] = React.useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    if (!listenToParams) return

    const isNew = searchParams.get("new") === "true"
    if (isNew) {
      setOpen(true)
      // Clear the search param to prevent reopening on navigation
      const params = new URLSearchParams(searchParams.toString())
      params.delete("new")
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }
  }, [searchParams, pathname, router, listenToParams])

  return (
    <ElectionDialog open={open} onOpenChange={setOpen}>
      <Button variant={variant} size={size} className={className}>
        <HugeiconsIcon icon={Add01Icon} strokeWidth={2.5} className="w-4 h-4" />
        {showText && "Create Election"}
      </Button>
    </ElectionDialog>
  )
}
