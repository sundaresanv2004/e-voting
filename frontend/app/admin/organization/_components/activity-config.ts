import {
  MapsIcon,
  ComputerIcon,
  UserGroupIcon,
  Settings02Icon,
  ViewIcon,
  ShieldKeyIcon,
  UserCircleIcon,
  Analytics01Icon,
  UserRemove01Icon,
  CheckmarkCircle02Icon,
  LockKeyIcon,
  Alert01Icon,
  Building06Icon,
} from "@hugeicons/core-free-icons"

export const typeConfig = {
  ELECTION: { icon: MapsIcon, color: "text-amber-600", bg: "bg-amber-500/10" },
  SYSTEM: { icon: ComputerIcon, color: "text-emerald-600", bg: "bg-emerald-500/10" },
  MEMBER: { icon: UserGroupIcon, color: "text-cyan-600", bg: "bg-cyan-500/10" },
}

export const actionConfig: Record<string, { icon: any; color: string; bg: string }> = {
  // Election lifecycle
  ELECTION_CREATED: { icon: MapsIcon, color: "text-amber-600", bg: "bg-amber-500/10" },
  ELECTION_UPDATED: { icon: MapsIcon, color: "text-amber-600", bg: "bg-amber-500/10" },
  ELECTION_DELETED: { icon: MapsIcon, color: "text-amber-600", bg: "bg-amber-500/10" },
  ELECTION_STATUS_CHANGED: { icon: MapsIcon, color: "text-amber-600", bg: "bg-amber-500/10" },
  ELECTION_SETTINGS_UPDATED: { icon: MapsIcon, color: "text-amber-600", bg: "bg-amber-500/10" },
  SETTINGS_UPDATED: { icon: Settings02Icon, color: "text-amber-600", bg: "bg-amber-500/10" },
  // Election code
  ELECTION_CODE_REVEALED: { icon: ViewIcon, color: "text-amber-600", bg: "bg-amber-500/10" },
  ELECTION_CODE_COPIED: { icon: ViewIcon, color: "text-amber-600", bg: "bg-amber-500/10" },
  // Organization
  ORGANIZATION_CREATED: { icon: Building06Icon, color: "text-indigo-600", bg: "bg-indigo-500/10" },
  ORGANIZATION_UPDATED: { icon: Building06Icon, color: "text-indigo-600", bg: "bg-indigo-500/10" },
  ORG_SETTINGS_UPDATED: { icon: Settings02Icon, color: "text-indigo-600", bg: "bg-indigo-500/10" },
  // Organization code
  ORG_CODE_REVEALED: { icon: ViewIcon, color: "text-indigo-600", bg: "bg-indigo-500/10" },
  ORG_CODE_COPIED: { icon: ViewIcon, color: "text-indigo-600", bg: "bg-indigo-500/10" },
  // Organization logo
  ORG_LOGO_UPLOADED: { icon: Building06Icon, color: "text-violet-600", bg: "bg-violet-500/10" },
  ORG_LOGO_REMOVED: { icon: Building06Icon, color: "text-rose-600", bg: "bg-rose-500/10" },
  // Ownership
  OWNERSHIP_TRANSFERRED: { icon: UserGroupIcon, color: "text-blue-600", bg: "bg-blue-500/10" },
  // Candidates & roles
  CANDIDATE_ADDED: { icon: UserGroupIcon, color: "text-violet-600", bg: "bg-violet-500/10" },
  CANDIDATE_UPDATED: { icon: UserGroupIcon, color: "text-violet-600", bg: "bg-violet-500/10" },
  CANDIDATE_REMOVED: { icon: UserGroupIcon, color: "text-violet-600", bg: "bg-violet-500/10" },
  CANDIDATE_DELETED: { icon: UserGroupIcon, color: "text-violet-600", bg: "bg-violet-500/10" },
  ROLE_CREATED: { icon: ShieldKeyIcon, color: "text-amber-600", bg: "bg-amber-500/10" },
  ROLE_DELETED: { icon: ShieldKeyIcon, color: "text-amber-600", bg: "bg-amber-500/10" },
  // Voters
  VOTER_ADDED: { icon: UserCircleIcon, color: "text-blue-600", bg: "bg-blue-500/10" },
  VOTER_DELETED: { icon: UserCircleIcon, color: "text-blue-600", bg: "bg-blue-500/10" },
  // Results
  RESULTS_GENERATED: { icon: Analytics01Icon, color: "text-emerald-600", bg: "bg-emerald-500/10" },
  RESULTS_PUBLISHED: { icon: Analytics01Icon, color: "text-emerald-600", bg: "bg-emerald-500/10" },
  // Members
  MEMBER_ADDED: { icon: UserGroupIcon, color: "text-cyan-600", bg: "bg-cyan-500/10" },
  MEMBER_UPDATED: { icon: UserGroupIcon, color: "text-cyan-600", bg: "bg-cyan-500/10" },
  MEMBER_LEFT: { icon: UserRemove01Icon, color: "text-rose-600", bg: "bg-rose-500/10" },
  MEMBER_REMOVED: { icon: UserRemove01Icon, color: "text-rose-600", bg: "bg-rose-500/10" },
  MEMBER_EMAIL_COPIED: { icon: ViewIcon, color: "text-cyan-600", bg: "bg-cyan-500/10" },
  // Systems
  SYSTEM_APPROVED: { icon: ComputerIcon, color: "text-emerald-600", bg: "bg-emerald-500/10" },
  SYSTEM_REVOKED: { icon: LockKeyIcon, color: "text-zinc-600", bg: "bg-zinc-500/10" },
  SYSTEM_REJECTED: { icon: Alert01Icon, color: "text-red-600", bg: "bg-red-500/10" },
  SYSTEM_CONNECTED: { icon: ComputerIcon, color: "text-emerald-600", bg: "bg-emerald-500/10" },
}

export const statusBadgeStyles: Record<string, string> = {
  // Election Status
  ACTIVE: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  UPCOMING: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  COMPLETED: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  PAUSED: "bg-amber-500/10 text-amber-600 border-amber-500/20",

  // System Status
  APPROVED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  PENDING: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  REJECTED: "bg-red-500/10 text-red-600 border-red-500/20",
  REVOKED: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20",
  EXPIRED: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  SUSPENDED: "bg-purple-500/10 text-purple-600 border-purple-500/20",

  // Member Roles
  ORG_ADMIN: "bg-indigo-50/50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
  STAFF: "bg-sky-50/50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20",
  VIEWER: "bg-slate-50/50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20",
  // General Status
  SUCCESS: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  FAILED: "bg-red-500/10 text-red-600 border-red-500/20",
}
