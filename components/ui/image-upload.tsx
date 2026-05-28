"use client"

import React, { useRef, useState } from "react"
import { ImageKitProvider, upload } from "@imagekit/next"
import { HugeiconsIcon } from "@hugeicons/react"
import { CloudUploadIcon, Delete02Icon, ImageAdd01Icon } from "@hugeicons/core-free-icons"
import { Button } from "./button"
import { Spinner } from "./spinner"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY

const authenticator = async () => {
  const response = await fetch("/api/imagekit-auth")
  if (!response.ok) {
    throw new Error(`Auth request failed with status ${response.status}`)
  }
  return response.json()
}

interface ImageUploadProps {
  value?: string
  onChange: (value: string) => void
  onUploadingChange?: (isUploading: boolean) => void
  disabled?: boolean
  folder?: string
  className?: string
  /**
   * Controls the aspect ratio / shape of the drop zone.
   * - "square"    → 1:1, good for logos / avatars
   * - "circle"    → 1:1 with full rounding, good for profile photos
   * - "landscape" → 16:9, good for banners / covers
   * - "portrait"  → 3:4, good for candidate cards / posters
   */
  variant?: "square" | "circle" | "landscape" | "portrait" | "rectangle"
}

export function ImageUpload({
  value,
  onChange,
  onUploadingChange,
  disabled = false,
  folder = "uploads",
  className,
  variant = "square",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const hasConfig = Boolean(urlEndpoint && publicKey)

  const handleUpload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10 MB")
      return
    }
    if (!hasConfig) {
      toast.error("Image upload is not configured.")
      return
    }

    setIsUploading(true)
    onUploadingChange?.(true)

    try {
      const authData = await authenticator()
      const res = await upload({
        file,
        fileName: `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`,
        publicKey: publicKey!,
        urlEndpoint: urlEndpoint!,
        folder,
        ...authData,
      })
      onChange(res.url ?? "")
      toast.success("Image uploaded!")
    } catch {
      toast.error("Upload failed — please try again.")
    } finally {
      setIsUploading(false)
      onUploadingChange?.(false)
    }
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
    // reset so the same file can be re-selected
    e.target.value = ""
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(e.type === "dragenter" || e.type === "dragover")
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    if (disabled || isUploading) return
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are supported.")
      return
    }
    await handleUpload(file)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("")
  }

  // ─── Aspect ratio class per variant ────────────────────────────────────────
  const aspectClass: Record<NonNullable<ImageUploadProps["variant"]>, string> = {
    square:    "aspect-square",
    circle:    "aspect-square",
    landscape: "aspect-video",
    portrait:  "aspect-[3/4]",
    rectangle: "aspect-[16/6]",   // wide banner — good for org logos
  }
  const roundedClass = variant === "circle" ? "rounded-full" : "rounded-3xl"

  return (
    <ImageKitProvider urlEndpoint={urlEndpoint ?? ""}>
      {/* outer wrapper always fills its parent's width */}
      <div className={cn("w-full", className)}>
        <div
          role={!value ? "button" : undefined}
          tabIndex={!value && !disabled ? 0 : -1}
          aria-label={!value ? "Upload image" : undefined}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && !isUploading && !value && fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !disabled && !isUploading && !value) {
              fileInputRef.current?.click()
            }
          }}
          className={cn(
            // ── base — mirrors the Input token aesthetics exactly ──────────
            "group relative w-full overflow-hidden border border-transparent bg-input/50",
            "transition-[color,box-shadow,background-color,border-color] outline-none",
            // shape
            aspectClass[variant ?? "square"],
            roundedClass,
            // interactive states (empty dropzone only)
            !value && !disabled && !isUploading && [
              "cursor-pointer",
              isDragActive
                ? "border-ring bg-input/70 ring-3 ring-ring/30"
                : "hover:border-border hover:bg-input/70",
            ],
            // focus-visible ring — identical to Input
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
            // uploading pulse
            isUploading && "animate-pulse cursor-wait",
            // when image loaded, cursor is default (buttons handle actions)
            value && !isUploading && "cursor-default",
            // disabled
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          {value ? (
            /* ── PREVIEW STATE ─────────────────────────────────────────── */
            <>
              <img
                src={value}
                alt="Uploaded image"
                className={cn(
                  "size-full object-contain p-2 bg-black/5 dark:bg-white/5 transition-opacity duration-300",
                  isUploading && "opacity-40 grayscale",
                )}
              />

              {/* scrim + action buttons — only revealed on hover */}
              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-center",
                  "bg-black/0 transition-all duration-200",
                  isUploading
                    ? "bg-black/30"
                    : "group-hover:bg-black/50",
                )}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-1.5">
                    <Spinner className="size-5 text-white" />
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-white/80">
                      Uploading
                    </span>
                  </div>
                ) : (
                  /* Two action buttons, hidden until hover */
                  <div className="flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
                      disabled={disabled}
                    >
                      <HugeiconsIcon icon={ImageAdd01Icon} data-icon="inline-start" strokeWidth={2} />
                      Replace
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleClear}
                      disabled={disabled}
                    >
                      <HugeiconsIcon icon={Delete02Icon} data-icon="inline-start" strokeWidth={2} />
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* ── EMPTY / DROPZONE STATE ────────────────────────────────── */
            <div className="flex size-full flex-col items-center justify-center gap-2 p-4 text-center select-none">
              {isUploading ? (
                <>
                  <Spinner className="size-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Uploading…</span>
                </>
              ) : (
                <>
                  <div
                    className={cn(
                      "flex size-9 items-center justify-center rounded-xl border border-border/60 bg-background/70",
                      "transition-transform duration-200 group-hover:-translate-y-0.5",
                      isDragActive && "-translate-y-0.5",
                    )}
                  >
                    <HugeiconsIcon
                      icon={CloudUploadIcon}
                      strokeWidth={1.5}
                      className={cn(
                        "size-5 text-muted-foreground transition-colors",
                        isDragActive && "text-primary",
                        !isDragActive && "group-hover:text-foreground",
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p
                      className={cn(
                        "text-sm font-medium text-muted-foreground transition-colors",
                        isDragActive && "text-primary",
                        !isDragActive && "group-hover:text-foreground",
                      )}
                    >
                      {isDragActive ? "Drop to upload" : "Click or drag & drop"}
                    </p>
                    {variant !== "circle" && (
                      <p className="text-xs text-muted-foreground/70">
                        PNG, JPEG, SVG · max 10 MB
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
            disabled={disabled || isUploading}
          />
        </div>
      </div>
    </ImageKitProvider>
  )
}
