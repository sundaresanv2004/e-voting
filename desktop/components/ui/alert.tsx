import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-lg border px-4 py-3 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2.5 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current border-destructive/20 bg-destructive/5",
        danger:
          "border-red-200/60 bg-red-50/50 text-red-600 [&>svg]:text-red-500/80 *:data-[slot=alert-description]:text-red-600/80 dark:border-red-800/40 dark:bg-red-950/20 dark:text-red-400 dark:[&>svg]:text-red-500/70 dark:*:data-[slot=alert-description]:text-red-400/80",
        error:
          "border-rose-200/60 bg-rose-50/50 text-rose-600 [&>svg]:text-rose-500/80 *:data-[slot=alert-description]:text-rose-600/80 dark:border-rose-800/40 dark:bg-rose-950/20 dark:text-rose-400 dark:[&>svg]:text-rose-500/70 dark:*:data-[slot=alert-description]:text-rose-400/80",
        alert:
          "border-amber-200/60 bg-amber-50/50 text-amber-600 [&>svg]:text-amber-500/80 *:data-[slot=alert-description]:text-amber-600/80 dark:border-amber-800/40 dark:bg-amber-950/20 dark:text-amber-400 dark:[&>svg]:text-amber-500/70 dark:*:data-[slot=alert-description]:text-amber-400/80",
        warning:
          "border-yellow-200/60 bg-yellow-50/50 text-yellow-600 [&>svg]:text-yellow-500/80 *:data-[slot=alert-description]:text-yellow-600/80 dark:border-yellow-800/40 dark:bg-yellow-950/20 dark:text-yellow-400 dark:[&>svg]:text-yellow-500/70 dark:*:data-[slot=alert-description]:text-yellow-400/80",
        info:
          "border-blue-200/60 bg-blue-50/50 text-blue-600 [&>svg]:text-blue-500/80 *:data-[slot=alert-description]:text-blue-600/80 dark:border-blue-800/40 dark:bg-blue-950/20 dark:text-blue-400 dark:[&>svg]:text-blue-500/70 dark:*:data-[slot=alert-description]:text-blue-400/80",
        success:
          "border-emerald-200/60 bg-emerald-50/50 text-emerald-600 [&>svg]:text-emerald-500/80 *:data-[slot=alert-description]:text-emerald-600/80 dark:border-emerald-800/40 dark:bg-emerald-950/20 dark:text-emerald-400 dark:[&>svg]:text-emerald-500/70 dark:*:data-[slot=alert-description]:text-emerald-400/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-heading font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-sm text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
        className
      )}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-2.5 right-3", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
