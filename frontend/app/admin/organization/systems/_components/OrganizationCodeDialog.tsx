"use client";

import * as React from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Copy01Icon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  FingerPrintIcon
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

interface OrganizationCodeDialogProps {
  code: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrganizationCodeDialog({
  code,
  open,
  onOpenChange,
}: OrganizationCodeDialogProps) {
  const [copied, setCopied] = React.useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Organization code copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-none p-0 overflow-hidden">
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-background p-8">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <HugeiconsIcon icon={FingerPrintIcon} className="h-24 w-24" />
          </div>

          <DialogHeader className="relative z-10 space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 ring-1 ring-emerald-500/20 shadow-sm">
              <HugeiconsIcon icon={FingerPrintIcon} className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold tracking-tight">Organization Access Code</DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1 text-base">
                This code allows offline systems to securely access and synchronize with your organization data.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="relative z-10 mt-8 space-y-6">
            <div className="group relative flex items-center justify-between p-6 rounded-[1.5rem] bg-white dark:bg-zinc-900 border-2 border-emerald-500/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:border-emerald-500/40">
              <span className="font-mono text-3xl font-bold tracking-[0.2em] text-emerald-600 dark:text-emerald-500 uppercase">
                {code}
              </span>
              <Button
                size="icon"
                variant="ghost"
                onClick={onCopy}
                className={cn(
                  "h-12 w-12 rounded-xl transition-all active:scale-90",
                  copied ? "text-emerald-600 bg-emerald-50" : "text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600"
                )}
              >
                {copied ? (
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-6 w-6" />
                ) : (
                  <HugeiconsIcon icon={Copy01Icon} className="h-6 w-6" />
                )}
              </Button>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              <HugeiconsIcon icon={InformationCircleIcon} className="h-5 w-5 mt-0.5 shrink-0" />
              <p className="text-xs leading-relaxed font-medium">
                This is your unique identifiers. Keep it secure. Anyone with this code might be able to request access to register devices.
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              variant={"outline"}
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

