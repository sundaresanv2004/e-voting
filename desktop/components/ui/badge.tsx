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
        danger:
          "border-red-200/50 bg-red-50/60 text-red-600 dark:border-red-800/30 dark:bg-red-950/20 dark:text-red-400 [a]:hover:bg-red-100 dark:[a]:hover:bg-red-950/30",
        error:
          "border-rose-200/50 bg-rose-50/60 text-rose-600 dark:border-rose-800/30 dark:bg-rose-950/20 dark:text-rose-400 [a]:hover:bg-rose-100 dark:[a]:hover:bg-rose-950/30",
        warning:
          "border-yellow-200/50 bg-yellow-50/60 text-yellow-600 dark:border-yellow-800/30 dark:bg-yellow-950/20 dark:text-yellow-400 [a]:hover:bg-yellow-100 dark:[a]:hover:bg-yellow-950/30",
        alert:
          "border-amber-200/50 bg-amber-50/60 text-amber-600 dark:border-amber-800/30 dark:bg-amber-950/20 dark:text-amber-400 [a]:hover:bg-amber-100 dark:[a]:hover:bg-amber-950/30",
        info:
          "border-blue-200/50 bg-blue-50/60 text-blue-600 dark:border-blue-800/30 dark:bg-blue-950/20 dark:text-blue-400 [a]:hover:bg-blue-100 dark:[a]:hover:bg-blue-950/30",
        success:
          "border-emerald-200/50 bg-emerald-50/60 text-emerald-600 dark:border-emerald-800/30 dark:bg-emerald-950/20 dark:text-emerald-400 [a]:hover:bg-emerald-100 dark:[a]:hover:bg-emerald-950/30",
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
