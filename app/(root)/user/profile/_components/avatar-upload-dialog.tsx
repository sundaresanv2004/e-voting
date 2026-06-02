"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ImageUpload } from "@/components/ui/image-upload"

interface AvatarUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentImage?: string | null
  onSave: (imageUrl: string) => Promise<void>
}

export function AvatarUploadDialog({
  open,
  onOpenChange,
  currentImage,
  onSave,
}: AvatarUploadDialogProps) {
  const [pendingImage, setPendingImage] = React.useState(currentImage || "")
  const [isSaving, setIsSaving] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setPendingImage(currentImage || "")
    }
  }, [open, currentImage])

  const handleSave = async () => {
    if (!pendingImage || pendingImage === currentImage) {
      onOpenChange(false)
      return
    }
    setIsSaving(true)
    try {
      await onSave(pendingImage)
      onOpenChange(false)
    } catch (err) {
      console.error("Avatar save error:", err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-6 py-5 border-b bg-card">
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Update Profile Picture
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Upload a square image. Max size 10 MB.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-8 flex items-center justify-center bg-card">
          <div className="w-full max-w-[260px]">
            <ImageUpload
              value={pendingImage}
              onChange={setPendingImage}
              disabled={isSaving}
              folder="avatars"
              variant="circle"
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/30 flex flex-row items-center justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !pendingImage || pendingImage === currentImage}
          >
            {isSaving ? (
              <>
                <Spinner />
                Saving…
              </>
            ) : (
              "Save Avatar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
