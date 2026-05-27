import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-border bg-input/30 text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
        success:
          "border-green-300 bg-green-50 text-green-800 dark:border-green-500/40 dark:bg-green-950/50 dark:text-green-200 [a]:hover:bg-green-100 dark:[a]:hover:bg-green-900/50",
        info:
          "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-500/40 dark:bg-blue-950/50 dark:text-blue-200 [a]:hover:bg-blue-100 dark:[a]:hover:bg-blue-900/50",
        warning:
          "border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-500/40 dark:bg-yellow-950/50 dark:text-yellow-200 [a]:hover:bg-yellow-100 dark:[a]:hover:bg-yellow-900/50",
        alert:
          "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/40 dark:bg-amber-950/50 dark:text-amber-200 [a]:hover:bg-amber-100 dark:[a]:hover:bg-amber-900/50",
        danger:
          "border-red-300 bg-red-50 text-red-800 dark:border-red-500/40 dark:bg-red-950/50 dark:text-red-200 [a]:hover:bg-red-100 dark:[a]:hover:bg-red-900/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
