"use client"

import * as React from "react"
import { ImageKitProvider, upload } from "@imagekit/next"
import { HugeiconsIcon } from "@hugeicons/react"
import { CloudUploadIcon, Loading03Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { Button } from "./button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY

const authenticator = async () => {
  try {
    const response = await fetch("/api/imagekit-auth")
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    throw new Error(`Authentication request failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

interface ImageUploadProps {
  value?: string
  onChange: (value: string) => void
  onUploadingChange?: (isUploading: boolean) => void
  disabled?: boolean
  folder?: string
  className?: string
}

export function ImageUpload({ value, onChange, onUploadingChange, disabled, folder, className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setIsUploading(true)
    onUploadingChange?.(true)
    try {
      const auth = await authenticator();
      const res = await upload({
        file,
        fileName: file.name,
        publicKey: publicKey || "",
        urlEndpoint: urlEndpoint || "",
        folder,
        ...auth
      });
      setIsUploading(false)
      onUploadingChange?.(false)
      onChange(res.url || "")
      toast.success("Image uploaded successfully!")
    } catch (err) {
      setIsUploading(false)
      onUploadingChange?.(false)
      console.error("Upload error", err)
      toast.error("Failed to upload image")
    }
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  return (
    <ImageKitProvider
      urlEndpoint={urlEndpoint!}
    >
      <div className="space-y-3 w-full h-full">
        <div
          className={cn(
            "relative group rounded-2xl border-2 flex flex-col items-center justify-center overflow-hidden transition-all duration-300 w-full h-full",
            !className?.includes("aspect-") && "aspect-[3/4] max-h-[350px]",
            value
              ? "border-transparent bg-muted/20 shadow-sm"
              : "border-dashed border-border hover:border-primary/40 hover:bg-primary/5 hover:shadow-md hover:shadow-primary/5",
            disabled && "opacity-50 cursor-not-allowed hover:bg-transparent hover:border-border hover:shadow-none",
            isUploading && "border-primary/50 bg-primary/5 scale-[0.98]",
            className
          )}
        >

          {value ? (
            <>
              <img
                src={value}
                alt="Uploaded"
                className={cn(
                  "h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]",
                  isUploading && "blur-md grayscale opacity-40 scale-110"
                )}
              />
              <div className={cn(
                "absolute inset-0 flex items-center justify-center gap-2 transition-all duration-300",
                isUploading
                  ? "bg-background/80 opacity-100"
                  : "bg-black/50 opacity-0 group-hover:opacity-100"
              )}>
                {isUploading ? (
                  <div className="flex flex-col items-center gap-3 transform scale-110 transition-transform">
                    <div className="h-12 w-12 rounded-2xl flex items-center justify-center relative overflow-hidden">
                      <HugeiconsIcon icon={Loading03Icon} className="w-5 h-5 text-primary animate-spin" strokeWidth={2.5} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse py-1">Processing</span>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    disabled={disabled}
                  >
                    Replace Image
                  </Button>
                )}
              </div>
              {!isUploading && (
                <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300 z-10 border border-white/20">
                  <HugeiconsIcon icon={Tick02Icon} className="w-4 h-4" strokeWidth={3} />
                </div>
              )}
            </>
          ) : (
            <div
              className={cn(
                "flex flex-col items-center gap-5 text-center cursor-pointer transition-all duration-300 border-none w-full h-full justify-center relative p-6",
                !disabled && !isUploading && "active:scale-[0.98]"
              )}
              onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
            >
              {/* Subtle background glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              <div className={cn(
                "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-500 z-10",
                isUploading
                  ? "bg-primary/10 shadow-inner scale-110"
                  : "bg-background shadow-sm border border-border/50 group-hover:border-primary/20 group-hover:bg-primary/5 group-hover:shadow-xl group-hover:shadow-primary/10 group-hover:-translate-y-2"
              )}>
                {isUploading ? (
                  <>
                    <HugeiconsIcon icon={Loading03Icon} className="w-5 h-5 animate-spin text-primary relative z-10" strokeWidth={2.5} />
                    <div className="absolute inset-0 rounded-[24px] border border-primary/30 animate-ping opacity-20 duration-1000" />
                  </>
                ) : (
                  <div className="relative">
                    <HugeiconsIcon icon={CloudUploadIcon} className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" strokeWidth={1.5} />
                  </div>
                )}
              </div>

              <div className="space-y-1.5 relative z-10 flex flex-col items-center w-full">
                <p className="text-sm font-bold text-foreground tracking-tight group-hover:text-primary transition-colors duration-300">
                  {isUploading ? "Uploading file..." : "Click to select a file"}
                </p>
                <p className="text-[11px] text-muted-foreground font-medium max-w-[200px] leading-relaxed">
                  {isUploading
                    ? "Securing & optimizing your image"
                    : "Supports PNG, JPEG, SVG & GIF files up to 10MB"}
                </p>
              </div>

              {isUploading && (
                <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden mt-2 relative z-10">
                  <div className="h-full bg-primary animate-progress-indeterminate rounded-full" />
                </div>
              )}
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={onFileChange}
            disabled={disabled || isUploading}
          />
        </div>
      </div>
    </ImageKitProvider>
  )
}
