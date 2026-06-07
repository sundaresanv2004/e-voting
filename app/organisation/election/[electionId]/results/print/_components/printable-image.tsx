"use client"

import * as React from "react"
import Image from "next/image"

interface PrintableImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null
  fallbackText: string
}

export function PrintableImage({ fallbackText, className, alt, src, ...props }: PrintableImageProps) {
  const [error, setError] = React.useState(false)

  // Reset error state when src changes
  React.useEffect(() => {
    setError(false)
  }, [src])

  if (error || !src) {
    return (
      <span className="absolute inset-0 flex flex-col items-center justify-center text-[8px] font-bold text-gray-400 text-center leading-tight p-1 z-0 bg-gray-50 overflow-hidden break-all">
        <span className="uppercase tracking-wider">{fallbackText}</span>
        {/* Temporary debug to see the URL */}
        {src && <span className="text-[6px] text-red-400 mt-1">{String(src).slice(0, 30)}...</span>}
      </span>
    )
  }

  return (
    <Image
      src={src}
      alt={alt || fallbackText}
      fill
      priority // Critical for print context so it doesn't lazy load
      className={`z-10 ${className ?? ""}`}
      onError={() => {
        console.log("PrintableImage onError fired for src:", src);
        setError(true);
      }}
      unoptimized // Just in case external URLs cause proxy issues
    />
  )
}
