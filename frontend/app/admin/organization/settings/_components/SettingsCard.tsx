import * as React from "react"
import { cn } from "@/lib/utils"

interface SettingsCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'content'> {
  title: React.ReactNode
  description?: React.ReactNode
  footer?: React.ReactNode
}

export function SettingsCard({
  title,
  description,
  children,
  footer,
  className,
  ...props
}: SettingsCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col overflow-hidden transition-all group",
        className
      )}
      {...props}
    >
      <div className="flex flex-col space-y-1 p-6">
        <h3 className="font-semibold tracking-tight text-lg">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground opacity-90">{description}</p>
        )}
      </div>
      
      <div className="p-6 pt-0 px-6 flex-1">
        {children}
      </div>

      {footer && (
        <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 p-4 px-6 bg-muted/30 border-t border-border/50 text-sm text-muted-foreground group-hover:bg-muted/40 transition-colors">
          {footer}
        </div>
      )}
    </div>
  )
}
