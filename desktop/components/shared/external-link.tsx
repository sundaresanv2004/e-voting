"use client"

import { openExternal } from "@/lib/open-external"

interface ExternalLinkProps {
    href: string
    children: React.ReactNode
    className?: string
}

export function ExternalLink({ href, children, className }: ExternalLinkProps) {
    return (
        <button
            type="button"
            onClick={() => openExternal(href)}
            className={className}
        >
            {children}
        </button>
    )
}
