import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DashboardCircleIcon,
  ArrowRight01Icon,
  UserGroupIcon,
  ShieldKeyIcon,
  UserCircleIcon,
  Analytics01Icon,
  Settings02Icon,
  Tag01Icon,
} from "@hugeicons/core-free-icons"

interface NavEntry {
  index: number
  total: number
  title: string
  desc: string
  href: string
  icon: any
  hoverText: string
}

function NavItem({ title, desc, href, icon: Icon, index, total, hoverText }: NavEntry) {
  const isBottomRow = index >= total - 2
  const isLast = index === total - 1

  return (
    <Link
      href={href}
      className={`group flex items-center justify-between border-b p-6 transition-all hover:bg-muted/40 sm:border-r sm:[&:nth-child(2n)]:border-r-0 border-border/50 ${isBottomRow ? "sm:border-b-0" : ""} ${isLast ? "border-b-0" : ""}`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-all duration-300 ${hoverText}`}
        >
          <HugeiconsIcon icon={Icon} className="h-5 w-5" strokeWidth={2} />
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-black tracking-tight">{title}</p>
          <p className="text-[11px] font-bold tracking-tight text-muted-foreground">{desc}</p>
        </div>
      </div>
      <HugeiconsIcon
        icon={ArrowRight01Icon}
        className="h-4 w-4 shrink-0 -translate-x-2 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
      />
    </Link>
  )
}

interface ElectionQuickNavigateProps {
  electionId: string
  hasCategories: boolean
  userRole?: string
}

export function ElectionQuickNavigate({ electionId, hasCategories, userRole }: ElectionQuickNavigateProps) {
  const navItems = [
    {
      title: "Candidate Slate",
      desc: "Profiles & symbol setup",
      href: `/organisation/election/${electionId}/candidates`,
      icon: UserGroupIcon,
      hoverText: "group-hover:text-indigo-600 dark:group-hover:text-indigo-400",
    },
    {
      title: "Contested Roles",
      desc: "Position configuration",
      href: `/organisation/election/${electionId}/roles`,
      icon: ShieldKeyIcon,
      hoverText: "group-hover:text-amber-600 dark:group-hover:text-amber-400",
    },
    {
      title: "Categories",
      desc: hasCategories ? "Voter groupings & tiers" : "No categories yet",
      href: `/organisation/election/${electionId}/categories`,
      icon: Tag01Icon,
      hoverText: "group-hover:text-teal-600 dark:group-hover:text-teal-400",
    },
    {
      title: "Voter Database",
      desc: "Admission IDs & eligibility",
      href: `/organisation/election/${electionId}/voters`,
      icon: UserCircleIcon,
      hoverText: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
    },
    {
      title: "Results",
      desc: "Data verification & export",
      href: `/organisation/election/${electionId}/results`,
      icon: Analytics01Icon,
      hoverText: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
      hideFor: ["viewer"],
    },
    {
      title: "Settings",
      desc: "Election configuration",
      href: `/organisation/election/${electionId}/settings`,
      icon: Settings02Icon,
      hoverText: "group-hover:text-violet-600 dark:group-hover:text-violet-400",
      hideFor: ["viewer"],
    },
  ].filter(item => !item.hideFor?.includes(userRole || ""))

  return (
    <Card className="overflow-hidden border-border/50 shadow-sm py-0 gap-0">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 px-4 py-3">
        <div className="space-y-0.5">
          <CardTitle className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <HugeiconsIcon icon={DashboardCircleIcon} className="h-5 w-5 text-primary" />
            Management Core
          </CardTitle>
          <CardDescription className="text-[11px] font-bold">
            Configure and monitor your election
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {navItems.map((item, index) => (
            <NavItem
              key={item.href}
              index={index}
              total={navItems.length}
              title={item.title}
              desc={item.desc}
              href={item.href}
              icon={item.icon}
              hoverText={item.hoverText}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
