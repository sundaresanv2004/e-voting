"use client"

import React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  icon?: any // Hugeicons icon reference
  actions?: React.ReactNode
  className?: string
  innerClassName?: string
}

export function PageHeader({ 
  title, 
  description, 
  icon: Icon, 
  actions,
  className,
  innerClassName
}: PageHeaderProps) {
  return (
    <div className={cn("relative border-b bg-background/50 backdrop-blur-sm", className)}>
      <div className={cn(
        "relative z-10 flex flex-col space-y-4 py-8 px-4 sm:px-6 lg:px-8 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 md:px-8 w-full mx-auto",
        innerClassName
      )}>
        <div className="flex items-center gap-5">
          {Icon && (
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-card text-primary shadow-sm ring-1 ring-border/50">
              <HugeiconsIcon icon={Icon} className="h-7 w-7 relative z-10" color="currentColor" />
            </div>
          )}
          <div className="space-y-1.5">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-3xl lg:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="text-sm font-medium text-muted-foreground/80 tracking-wide">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

