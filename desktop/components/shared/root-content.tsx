"use client"

import React from "react"
import { useTerminal } from "@/components/shared/terminal-context"
import { ThemeSync } from "@/components/shared/theme-sync"
import { Spinner } from "@/components/ui/spinner"

export function RootContent({ children }: { children: React.ReactNode }) {
  const { loading } = useTerminal();

  return (
    <>
      <ThemeSync />
      {children}
    </>
  );
}
