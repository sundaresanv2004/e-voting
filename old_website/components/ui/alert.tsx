import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-lg border px-4 py-3 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2.5 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive: "bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current border-destructive/20 bg-destructive/5",
        danger: 'border-red-300 bg-red-50 text-red-800 [&>svg]:text-red-600 *:data-[slot=alert-description]:text-red-700 dark:border-red-500/40 dark:bg-red-950/50 dark:text-red-200 dark:[&>svg]:text-red-400 dark:*:data-[slot=alert-description]:text-red-300',
        alert: 'border-amber-300 bg-amber-50 text-amber-800 [&>svg]:text-amber-600 *:data-[slot=alert-description]:text-amber-700 dark:border-amber-500/40 dark:bg-amber-950/50 dark:text-amber-200 dark:[&>svg]:text-amber-400 dark:*:data-[slot=alert-description]:text-amber-300',
        warning: 'border-yellow-300 bg-yellow-50 text-yellow-800 [&>svg]:text-yellow-600 *:data-[slot=alert-description]:text-yellow-700 dark:border-yellow-500/40 dark:bg-yellow-950/50 dark:text-yellow-200 dark:[&>svg]:text-yellow-400 dark:*:data-[slot=alert-description]:text-yellow-300',
        info: 'border-blue-300 bg-blue-50 text-blue-800 [&>svg]:text-blue-600 *:data-[slot=alert-description]:text-blue-700 dark:border-blue-500/40 dark:bg-blue-950/50 dark:text-blue-200 dark:[&>svg]:text-blue-400 dark:*:data-[slot=alert-description]:text-blue-300',
        success: 'border-green-300 bg-green-50 text-green-800 [&>svg]:text-green-600 *:data-[slot=alert-description]:text-green-700 dark:border-green-500/40 dark:bg-green-950/50 dark:text-green-200 dark:[&>svg]:text-green-400 dark:*:data-[slot=alert-description]:text-green-300',
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
