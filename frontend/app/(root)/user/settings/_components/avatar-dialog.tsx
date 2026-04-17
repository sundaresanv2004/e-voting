"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Loading03Icon,
} from "@hugeicons/core-free-icons"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ImageUpload } from "@/components/ui/image-upload"

interface AvatarDialogProps {
  isOpen: boolean
  onClose: () => void
  currentImage?: string | null
  onSave: (imageUrl: string) => Promise<void>
}

export function AvatarDialog({ isOpen, onClose, currentImage, onSave }: AvatarDialogProps) {
  const [pendingImage, setPendingImage] = React.useState<string>(currentImage || "")
  const [isSaving, setIsSaving] = React.useState(false)

  // Reset internal state when dialog opens or initial image changes
  React.useEffect(() => {
    if (isOpen) {
      setPendingImage(currentImage || "")
    }
  }, [isOpen, currentImage])

  const handleSave = async () => {
    if (!pendingImage || pendingImage === currentImage) {
      onClose()
      return
    }

    setIsSaving(true)
    try {
      await onSave(pendingImage)
      onClose()
    } catch (err) {
      console.error("Save error", err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0 flex flex-col rounded-3xl">
        <DialogHeader className="px-6 py-4 border-b bg-card relative gap-1 overflow-hidden">
          <DialogTitle className="font-semibold text-xl tracking-tight">
            Update Profile Picture
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground/80">
            Choose square image. Max size 10MB.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col items-center justify-center bg-card">
          <div className="w-full max-w-[280px]">
            <ImageUpload
              value={pendingImage}
              onChange={setPendingImage}
              disabled={isSaving}
              folder="avatars"
              className="aspect-square"
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t flex flex-row items-center justify-end gap-3 bg-muted/30">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !pendingImage || pendingImage === currentImage}
          >
            {isSaving ? (
              <>
                <HugeiconsIcon icon={Loading03Icon} className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Save
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
