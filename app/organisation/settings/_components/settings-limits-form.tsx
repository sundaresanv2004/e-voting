"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Settings02Icon, Building03Icon, Image01Icon, Alert01Icon } from "@hugeicons/core-free-icons"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface SettingsLimitsFormProps {
  settings: {
    maxElections: number
    maxMembers: number
    allowCustomBranding: boolean
  }
}

export function SettingsLimitsForm({ settings }: SettingsLimitsFormProps) {
  let planName = "Free"
  let alertClasses = "bg-blue-50/50 border-blue-200 text-blue-900 dark:bg-blue-950/20 dark:border-blue-800 dark:text-blue-300"

  if (settings.maxElections >= 20) {
    planName = "Max"
    alertClasses = "bg-amber-50/50 border-amber-200 text-amber-900 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-300"
  } else if (settings.maxElections >= 10) {
    planName = "Pro"
    alertClasses = "bg-purple-50/50 border-purple-200 text-purple-900 dark:bg-purple-950/20 dark:border-purple-800 dark:text-purple-300"
  }

  return (
    <div className="space-y-6">
      {/* Plan Alert */}
      <Alert className={alertClasses}>
        <HugeiconsIcon icon={Alert01Icon} className="size-4 !text-current" />
        <AlertTitle className="font-semibold">Current Plan: {planName}</AlertTitle>
        <AlertDescription>
          These limits and settings are managed by your current subscription plan. To upgrade capacity or enable branding, contact <a href="mailto:contact@sundaresan.dev" className="font-medium underline underline-offset-4 hover:opacity-80">contact@sundaresan.dev</a>.
        </AlertDescription>
      </Alert>

      {/* Card 1: Elections */}
      <Card className="gap-0">
        <CardHeader className="border-b flex flex-row items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5">
            <HugeiconsIcon icon={Settings02Icon} className="size-4" />
          </div>
          <div className="space-y-1">
            <CardTitle>Election Limits</CardTitle>
            <CardDescription>
              The maximum number of active elections allowed for your organization.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Maximum Active Elections</h4>
              <p className="text-sm text-muted-foreground">The total number of elections you can run concurrently.</p>
            </div>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium text-sm w-fit border border-primary/20">
              {settings.maxElections} {settings.maxElections === 1 ? 'Election' : 'Elections'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Candidates */}
      <Card className="gap-0">
        <CardHeader className="border-b flex flex-row items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5">
            <HugeiconsIcon icon={Building03Icon} className="size-4" />
          </div>
          <div className="space-y-1">
            <CardTitle>Candidate Limits</CardTitle>
            <CardDescription>
              The maximum capacity for candidates in this organization.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Organization Capacity</h4>
              <p className="text-sm text-muted-foreground">The maximum number of candidates that can be added to this organization.</p>
            </div>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium text-sm w-fit border border-primary/20">
              {settings.maxMembers} {settings.maxMembers === 1 ? 'Candidate' : 'Candidates'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Custom Branding */}
      <Card className="gap-0">
        <CardHeader className="border-b flex flex-row items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5">
            <HugeiconsIcon icon={Image01Icon} className="size-4" />
          </div>
          <div className="space-y-1">
            <CardTitle>Custom Branding</CardTitle>
            <CardDescription>
              Enable custom branding to display your logo on all election voting pages.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Custom Logo on Voting Pages</h4>
              <p className="text-sm text-muted-foreground">Override the default E-Voting brand with your organization's logo.</p>
            </div>
            <div className="shrink-0">
              {settings.allowCustomBranding ? (
                <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold bg-green-500/10 text-green-600 border-green-500/20">
                  Enabled
                </div>
              ) : (
                <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold bg-muted text-muted-foreground">
                  Disabled
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
