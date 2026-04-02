"use client"

import * as React from "react"
import { ImageKitProvider, upload } from "@imagekit/next"
import { HugeiconsIcon } from "@hugeicons/react"
import { Image01Icon, Upload02Icon, Loading03Icon, Tick02Icon } from "@hugeicons/core-free-icons"
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
  disabled?: boolean
  folder?: string
}

export function ImageUpload({ value, onChange, disabled, folder }: ImageUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
       toast.error("File size must be less than 10MB");
       return;
    }

    setIsUploading(true)
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
      onChange(res.url || "")
      toast.success("Image uploaded successfully!")
    } catch (err) {
      setIsUploading(false)
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
      <div className="space-y-3">
        <div 
          className={cn(
            "relative group aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all duration-200",
            value ? "border-primary/20 bg-primary/5" : "border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/5",
            disabled && "opacity-50 cursor-not-allowed",
            isUploading && "border-primary animate-pulse"
          )}
        >
          {value ? (
            <>
              <img 
                src={value} 
                alt="Uploaded" 
                className={cn(
                  "h-full w-full object-cover transition-transform duration-500 group-hover:scale-110",
                  isUploading && "blur-sm grayscale opacity-50"
                )}
              />
              <div className={cn(
                "absolute inset-0 flex items-center justify-center gap-2 transition-all duration-300",
                isUploading ? "bg-black/20 opacity-100" : "bg-black/40 opacity-0 group-hover:opacity-100"
              )}>
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center animate-spin">
                      <HugeiconsIcon icon={Loading03Icon} className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-white tracking-widest animate-pulse">Uploading</span>
                  </div>
                ) : (
                  <Button 
                    type="button" 
                    variant="secondary" 
                    size="sm" 
                    className="rounded-xl h-8 text-[10px] font-bold shadow-xl border-none"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled}
                  >
                     Change Image
                  </Button>
                )}
              </div>
              {!isUploading && (
                <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
                   <HugeiconsIcon icon={Tick02Icon} className="w-3.5 h-3.5" strokeWidth={3} />
                </div>
              )}
            </>
          ) : (
            <div 
               className={cn(
                 "flex flex-col items-center gap-4 p-6 text-center cursor-pointer transition-all duration-300 border-none w-full h-full justify-center",
                 !disabled && !isUploading && "active:scale-95"
               )}
               onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
            >
              <div className={cn(
                "h-16 w-16 rounded-[2rem] flex items-center justify-center transition-all duration-500",
                isUploading ? "bg-primary/20 scale-110" : "bg-muted group-hover:bg-primary/20 group-hover:text-primary text-muted-foreground"
              )}>
                {isUploading ? (
                  <div className="relative">
                    <HugeiconsIcon icon={Loading03Icon} className="w-8 h-8 animate-spin text-primary" />
                    <div className="absolute inset-0 w-8 h-8 rounded-full border-2 border-primary/30 border-t-transparent animate-spin-slow" />
                  </div>
                ) : (
                  <HugeiconsIcon icon={Image01Icon} className="w-8 h-8" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-black uppercase tracking-widest text-foreground">
                  {isUploading ? "Taking a moment..." : "Click to upload"}
                </p>
                <p className="text-[10px] text-muted-foreground font-medium opacity-60 italic">
                  {isUploading ? "Optimizing & Securing your file" : "JPG, PNG, GIF up to 10MB"}
                </p>
              </div>
              {isUploading && (
                <div className="w-24 h-1 bg-muted rounded-full overflow-hidden mt-2 border-none">
                   <div className="h-full bg-primary animate-progress-indeterminate border-none" />
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
