"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert01Icon, Home01Icon } from "@hugeicons/core-free-icons"

interface AdminErrorBoundaryProps {
  children: React.ReactNode
}

interface AdminErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class AdminErrorBoundary extends React.Component<AdminErrorBoundaryProps, AdminErrorBoundaryState> {
  constructor(props: AdminErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): AdminErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ADMIN_ERROR_BOUNDARY]", error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-1 items-center justify-center p-6 lg:p-12 min-h-[70vh]">
          <div className="w-full max-w-md flex flex-col items-center text-center space-y-6">
            <div className="p-4 rounded-full bg-destructive/10 border border-destructive/20 shadow-sm backdrop-blur-sm text-destructive">
              <HugeiconsIcon icon={Alert01Icon} className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight">Oops!</h1>
              <h2 className="text-2xl font-semibold tracking-tight">Something went wrong</h2>
              <p className="text-muted-foreground text-sm max-w-[320px] mx-auto">
                An unexpected error occurred in the admin dashboard. Our team has been notified.
              </p>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <Button onClick={this.resetError} size="lg" variant="default">
                Try again
              </Button>
              <Link href="/admin/organization">
                <Button size="lg" variant="outline" className="gap-2">
                  <HugeiconsIcon icon={Home01Icon} className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
