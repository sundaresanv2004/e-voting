"use client"

import React from "react"
import { useTerminal } from "@/components/shared/terminal-context"
import { ThemeSync } from "@/components/shared/theme-sync"
import { Spinner } from "@/components/ui/spinner"

export function RootContent({ children }: { children: React.ReactNode }) {
  const { loading } = useTerminal();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center p-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-t-2 border-primary animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-8 h-8 rounded-full bg-primary/10 animate-pulse" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-base font-bold tracking-tight text-foreground animate-pulse">Initializing Terminal</p>
            <p className="text-xs text-muted-foreground">Establising secure handshake with voting server...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ThemeSync />
      {children}
    </>
  );
}
