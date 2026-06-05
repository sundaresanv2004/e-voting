"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  LayoutBottomIcon,
  UserGroupIcon,
  Shield02Icon,
  GridIcon,
  UserCircleIcon,
  Analytics01Icon,
  Settings02Icon,
  MapsIcon,
  ShieldKeyIcon,
  Building06Icon,
  UserAdd01Icon,
  AddCircleHalfDotIcon,
  UserStar01Icon,
  UserCheck01Icon,
  Moon02Icon,
  Sun03Icon,
  ComputerIcon,
  ArrowRight01Icon,
  SecurityCheckIcon,
} from "@hugeicons/core-free-icons"
import { useTheme } from "next-themes"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Kbd, KbdGroup } from "@/components/ui/kbd"

export function GlobalSearch({ userRole }: { userRole?: string }) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const params = useParams()
  const { setTheme } = useTheme()

  // Resolve the active election ID from the URL params
  const electionId = params?.electionId as string | undefined

  const isOrgAdmin = userRole === "ORG_ADMIN"
  const isStaff = userRole === "STAFF"
  const isViewer = userRole === "VIEWER"

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  // Helper: navigate to election sub-page (with ?new=true for quick create actions)
  const toElection = (sub: string, query = "") =>
    electionId
      ? `/organisation/election/${electionId}/${sub}${query}`
      : `/organisation/election`

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            aria-label="Open command palette"
          >
            <HugeiconsIcon icon={Search01Icon} className="h-4 w-4" strokeWidth={2} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest">Search</span>
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </TooltipContent>
      </Tooltip>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="top-1/3 translate-y-0 overflow-hidden !rounded-2xl p-0 sm:max-w-xl"
          showCloseButton={false}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Command Palette</DialogTitle>
            <DialogDescription>Search pages, navigate, and run quick actions.</DialogDescription>
          </DialogHeader>
          <Command>
            <CommandInput placeholder="Search or type a command..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>

              {/* ── Quick Actions ─────────────────────────────────────── */}
              {(isOrgAdmin || isStaff) && (
                <CommandGroup heading="Quick Actions">
                  <CommandItem
                    onSelect={() => runCommand(() => router.push(toElection("candidates", "?new=true")))}
                  >
                    <HugeiconsIcon icon={UserAdd01Icon} strokeWidth={2} />
                    <span>Add Candidate</span>
                    <CommandShortcut>
                      <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-3.5 opacity-50" />
                    </CommandShortcut>
                  </CommandItem>
                  <CommandItem
                    onSelect={() => runCommand(() => router.push(toElection("voters", "?new=true")))}
                  >
                    <HugeiconsIcon icon={UserCheck01Icon} strokeWidth={2} />
                    <span>Add Voter</span>
                    <CommandShortcut>
                      <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-3.5 opacity-50" />
                    </CommandShortcut>
                  </CommandItem>
                  <CommandItem
                    onSelect={() => runCommand(() => router.push(toElection("roles", "?new=true")))}
                  >
                    <HugeiconsIcon icon={UserStar01Icon} strokeWidth={2} />
                    <span>Add Role</span>
                    <CommandShortcut>
                      <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-3.5 opacity-50" />
                    </CommandShortcut>
                  </CommandItem>
                  <CommandItem
                    onSelect={() => runCommand(() => router.push(toElection("categories", "?new=true")))}
                  >
                    <HugeiconsIcon icon={GridIcon} strokeWidth={2} />
                    <span>Add Category</span>
                    <CommandShortcut>
                      <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-3.5 opacity-50" />
                    </CommandShortcut>
                  </CommandItem>
                  {isOrgAdmin && (
                    <>
                      <CommandItem
                        onSelect={() => runCommand(() => router.push("/organisation/elections?new=true"))}
                      >
                        <HugeiconsIcon icon={AddCircleHalfDotIcon} strokeWidth={2} />
                        <span>Create Election</span>
                        <CommandShortcut>
                          <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-3.5 opacity-50" />
                        </CommandShortcut>
                      </CommandItem>
                      <CommandItem
                        onSelect={() => runCommand(() => router.push("/organisation/members?invite=true"))}
                      >
                        <HugeiconsIcon icon={UserAdd01Icon} strokeWidth={2} />
                        <span>Invite Member</span>
                        <CommandShortcut>
                          <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-3.5 opacity-50" />
                        </CommandShortcut>
                      </CommandItem>
                    </>
                  )}
                </CommandGroup>
              )}

              {(isOrgAdmin || isStaff) && <CommandSeparator />}

              {/* ── Election Navigation ───────────────────────────────── */}
              <CommandGroup heading="Election">
                <CommandItem
                  onSelect={() => runCommand(() => router.push(toElection("")))}
                >
                  <HugeiconsIcon icon={LayoutBottomIcon} strokeWidth={2} />
                  <span>Election Dashboard</span>
                  <CommandShortcut>Election</CommandShortcut>
                </CommandItem>
                <CommandItem
                  onSelect={() => runCommand(() => router.push(toElection("candidates")))}
                >
                  <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />
                  <span>Candidates</span>
                  <CommandShortcut>Election</CommandShortcut>
                </CommandItem>
                <CommandItem
                  onSelect={() => runCommand(() => router.push(toElection("roles")))}
                >
                  <HugeiconsIcon icon={Shield02Icon} strokeWidth={2} />
                  <span>Roles</span>
                  <CommandShortcut>Election</CommandShortcut>
                </CommandItem>
                <CommandItem
                  onSelect={() => runCommand(() => router.push(toElection("categories")))}
                >
                  <HugeiconsIcon icon={GridIcon} strokeWidth={2} />
                  <span>Categories</span>
                  <CommandShortcut>Election</CommandShortcut>
                </CommandItem>
                <CommandItem
                  onSelect={() => runCommand(() => router.push(toElection("voters")))}
                >
                  <HugeiconsIcon icon={UserCircleIcon} strokeWidth={2} />
                  <span>Voters</span>
                  <CommandShortcut>Election</CommandShortcut>
                </CommandItem>
                {(isOrgAdmin || isStaff) && (
                  <CommandItem
                    onSelect={() => runCommand(() => router.push(toElection("results")))}
                  >
                    <HugeiconsIcon icon={Analytics01Icon} strokeWidth={2} />
                    <span>Results</span>
                    <CommandShortcut>Election</CommandShortcut>
                  </CommandItem>
                )}
                {(isOrgAdmin || isStaff) && (
                  <CommandItem
                    onSelect={() => runCommand(() => router.push(toElection("settings")))}
                  >
                    <HugeiconsIcon icon={SecurityCheckIcon} strokeWidth={2} />
                    <span>Election Settings</span>
                    <CommandShortcut>Election</CommandShortcut>
                  </CommandItem>
                )}
              </CommandGroup>

              <CommandSeparator />

              {/* ── Organisation Navigation ───────────────────────────── */}
              {isOrgAdmin && (
                <>
                  <CommandGroup heading="Organisation">
                    <CommandItem
                      onSelect={() => runCommand(() => router.push("/organisation"))}
                    >
                      <HugeiconsIcon icon={Building06Icon} strokeWidth={2} />
                      <span>Org Dashboard</span>
                      <CommandShortcut>Organisation</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                      onSelect={() => runCommand(() => router.push("/organisation/elections"))}
                    >
                      <HugeiconsIcon icon={MapsIcon} strokeWidth={2} />
                      <span>All Elections</span>
                      <CommandShortcut>Organisation</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                      onSelect={() => runCommand(() => router.push("/organisation/members"))}
                    >
                      <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />
                      <span>Members</span>
                      <CommandShortcut>Organisation</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                      onSelect={() => runCommand(() => router.push("/organisation/settings"))}
                    >
                      <HugeiconsIcon icon={Settings02Icon} strokeWidth={2} />
                      <span>Org Settings</span>
                      <CommandShortcut>Organisation</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                      onSelect={() => runCommand(() => router.push("/organisation/audit-logs"))}
                    >
                      <HugeiconsIcon icon={ShieldKeyIcon} strokeWidth={2} />
                      <span>Audit Logs</span>
                      <CommandShortcut>Organisation</CommandShortcut>
                    </CommandItem>
                  </CommandGroup>
    
                  <CommandSeparator />
                </>
              )}

              {/* ── Appearance ────────────────────────────────────────── */}
              <CommandGroup heading="Appearance">
                <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
                  <HugeiconsIcon icon={Sun03Icon} strokeWidth={2} />
                  <span>Light Mode</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
                  <HugeiconsIcon icon={Moon02Icon} strokeWidth={2} />
                  <span>Dark Mode</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
                  <HugeiconsIcon icon={ComputerIcon} strokeWidth={2} />
                  <span>System Default</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  )
}
