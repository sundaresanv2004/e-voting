"use client";

import * as React from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Copy01Icon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  ShieldKeyIcon
} from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ElectionCodeDialogProps {
  code: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ElectionCodeDialog({
  code,
  open,
  onOpenChange,
}: ElectionCodeDialogProps) {
  const [copied, setCopied] = React.useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Election code copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-none p-0 overflow-hidden">
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-background p-8">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <HugeiconsIcon icon={ShieldKeyIcon} className="h-24 w-24" />
          </div>

          <DialogHeader className="relative z-10 space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 ring-1 ring-indigo-500/20 shadow-sm">
              <HugeiconsIcon icon={ShieldKeyIcon} className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold tracking-tight">Election Access Code</DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1 text-base">
                Used by voting terminals and systems to securely identify and connect to this specific election.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="relative z-10 mt-8 space-y-6">
            <div className="group relative flex items-center justify-between p-6 rounded-[1.5rem] bg-white dark:bg-zinc-900 border-2 border-indigo-500/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:border-indigo-500/40">
              <span className="font-mono text-3xl font-bold tracking-[0.2em] text-indigo-600 dark:text-indigo-500 uppercase">
                {code}
              </span>
              <Button
                size="icon"
                variant="ghost"
                onClick={onCopy}
                className={cn(
                  "h-12 w-12 rounded-xl transition-all active:scale-90",
                  copied ? "text-indigo-600 bg-indigo-50" : "text-muted-foreground hover:bg-indigo-50 hover:text-indigo-600"
                )}
              >
                {copied ? (
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-6 w-6" />
                ) : (
                  <HugeiconsIcon icon={Copy01Icon} className="h-6 w-6" />
                )}
              </Button>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-indigo-700 dark:text-indigo-400">
              <HugeiconsIcon icon={InformationCircleIcon} className="h-5 w-5 mt-0.5 shrink-0" />
              <p className="text-xs leading-relaxed font-medium">
                Keep this code secure. This identifier allows registered terminals to connect. Modifying it after creation is heavily restricted.
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
