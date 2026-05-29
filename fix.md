# Security Audit Report — E-Voting Platform
## Scope: Auth + Organisation Setup Layer
> Audited: May 29, 2026 | Stack: Next.js · Better Auth · Prisma · PostgreSQL · shadcn/ui

---

## Overall Verdict

Your foundation is genuinely solid — transactions everywhere, Zod validation, audit logging, and no raw SQL. The issues below are real but fixable, and none require a structural rewrite. They are grouped by severity.

---

## 🔴 Critical Issues

### 1. No Server-Side Role Check on `addMemberAction` / `updateMemberAccess`

**File:** `lib/actions/member.ts`

`addMemberAction` and `updateMemberAccess` verify only that a session exists and an `activeOrganizationId` is set. They do **not** verify that the calling user is an `owner` or `admin` of that org. Any authenticated `staff` or `viewer` member can currently call these actions and promote themselves or others.

**Fix — add this at the top of both functions, after the orgId check:**
```typescript
const callerMember = await db.member.findFirst({
  where: { userId: session.user.id, organizationId: orgId }
})
if (!callerMember || (callerMember.role !== "owner" && callerMember.role !== "admin")) {
  return { success: false, error: "Forbidden" }
}
```

---

### 2. `updateOrganizationProfile` Has No Role Guard

**File:** `lib/actions/settings.ts`

`updateOrganizationProfile()` only checks for a valid session. Any org member — including a `viewer` — can rename or change the logo of the organisation.

**Fix — add after `const adminId = session.user.id`:**
```typescript
const callerMember = await db.member.findFirst({
  where: { userId: adminId, organizationId: orgId }
})
if (!callerMember || (callerMember.role !== "owner" && callerMember.role !== "admin")) {
  return { success: false, error: "Forbidden" }
}
```

---

### 3. `getOrganizationData` Returns Full Row to Any Authenticated Member

**File:** `lib/actions/settings.ts`

`getOrganizationData()` returns the entire organisation DB row to anyone with a session and an `activeOrganizationId`. Scope the response to only the fields the UI needs.

**Fix — add `select` to the Prisma query:**
```typescript
const organization = await db.organization.findUnique({
  where: { id: orgId },
  select: {
    id: true,
    name: true,
    slug: true,
    logo: true,
    type: true,
    code: true,
    isActive: true,
    createdAt: true,
  }
})
```

---

## 🟠 High Severity Issues

### 4. `requireOrgAdmin` in `election.ts` Is Not Scoped to Active Org

**File:** `lib/actions/election.ts`

```typescript
// ❌ Current — no organizationId filter
const member = await db.member.findFirst({
  where: { userId: session.user.id },
  include: { organization: true }
})
```

If a user is a member of multiple orgs (edge case now, real case when you scale), this returns the **first** membership found, which may not match the active org in session. This could allow cross-org election mutations.

**Fix — scope to active org:**
```typescript
const orgId = session.session.activeOrganizationId
if (!orgId) throw new Error("No active organization")

const member = await db.member.findFirst({
  where: { userId: session.user.id, organizationId: orgId }, // ✅ scoped
  include: { organization: true }
})
```

---

### 5. `transferOwnershipAction` Does Not Verify New Owner Belongs to the Org

**File:** `lib/actions/settings.ts`

The action verifies the current user is the owner but does **not** verify that `newOwnerUserId` is actually a member of the same organisation. An org owner could transfer ownership to any arbitrary user ID in the system.

**Fix — add before calling `auth.api.updateMemberRole`:**
```typescript
const newOwnerMember = await db.member.findFirst({
  where: { userId: newOwnerUserId, organizationId: orgId }
})
if (!newOwnerMember) {
  return { success: false, error: "Target user is not a member of this organization." }
}
```

---

### 6. No HTTP Security Headers in `next.config.ts`

**File:** `next.config.ts`

Zero security headers are currently set — no CSP, no `X-Frame-Options`, no `X-Content-Type-Options`, no `Referrer-Policy`.

**Fix — update `next.config.ts`:**
```typescript
import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  // ...your existing images config
};

export default nextConfig;
```

---

### 7. `RateLimit` Table Exists But Is Never Used

**File:** `lib/auth/index.tsx`

The DB has a `RateLimit` table but login, OTP send, and password reset routes have **no rate limiting** at all. This leaves you open to credential stuffing and OTP brute-force attacks.

**Fix — add `rateLimit` to your Better Auth config in `lib/auth/index.tsx`:**
```typescript
export const auth = betterAuth({
  // ...existing config
  rateLimit: {
    enabled: true,
    window: 60,       // seconds
    max: 10,          // max requests per window per IP
    storage: "database", // uses your existing RateLimit table
  },
  // ...rest of config
});
```

---

## 🟡 Medium Severity Issues

### 8. `searchPotentialMember` Exposes User Enumeration to Any Org Member

**File:** `lib/actions/member.ts`

Any authenticated member (including `viewer`) can call this and enumerate users by name or email. Since only owners/admins can add members, restrict this action to them as well using the same `callerMember.role` check from Issue #1.

---

### 9. `generateCode` in `election.ts` Uses `Math.random()` (Not Cryptographically Secure)

**File:** `lib/actions/election.ts`

```typescript
// ❌ Current — not cryptographically secure
result += chars.charAt(Math.floor(Math.random() * chars.length))
```

Your `org.ts` already does this correctly with `crypto.randomBytes`. Reuse that pattern:

**Fix — replace `generateCode` in `election.ts`:**
```typescript
import { randomBytes } from "crypto"

function generateCode(orgName: string = "EV") {
  const sanitized = orgName.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()
  const prefix = sanitized.length >= 3 ? sanitized.substring(0, 4) : "EV"
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const bytes = randomBytes(6)
  const suffix = Array.from(bytes, (byte) => chars[byte % chars.length]).join("")
  return `${prefix}-${suffix}`
}
```

---

### 10. `updateMemberAccess` Clears Election Access Globally, Not Org-Scoped

**File:** `lib/actions/member.ts`

```typescript
// ❌ Current — deletes access across ALL orgs for this user
await tx.userElectionAccess.deleteMany({
  where: { userId }
})
```

When you scale to multi-org, this will wipe a user's election access in other organisations.

**Fix — scope the delete to the current org:**
```typescript
await tx.userElectionAccess.deleteMany({
  where: {
    userId,
    election: { organizationId: orgId } // ✅ scoped to current org only
  }
})
```

---

### 11. Audit Logs Never Capture Failures

**Files:** `lib/actions/member.ts`, `lib/actions/settings.ts`, `lib/actions/election.ts`

Every `AdminAuditLog` entry has `status: AuditStatus.SUCCESS` hardcoded. Failed permission checks and errors are never logged.

**Fix — add a failure log in the `catch` block of critical actions:**
```typescript
} catch (error: any) {
  await db.adminAuditLog.create({
    data: {
      action: "ACTION_NAME_FAILED",
      entityType: AuditEntityType.USER,
      adminId: session?.user?.id,
      organizationId: orgId,
      status: AuditStatus.FAILURE,
      metadata: { error: error.message },
    }
  }).catch(() => {}) // silent catch so logging never breaks the response
  return { success: false, error: error.message || "Operation failed" }
}
```

---

### 12. `OrganizationSchema` Doesn't Validate Logo URL

**File:** `lib/schemas/org.ts`

`logo` is `z.string().optional()` — any arbitrary string passes.

**Fix — tighten the schema:**
```typescript
logo: z
  .string()
  .url("Invalid logo URL")
  .refine(
    (val) => val.startsWith("https://ik.imagekit.io/"),
    "Logo must be an ImageKit URL"
  )
  .optional(),
```

---

## 🟢 Minor Items

| # | File | Issue | Recommendation |
|---|------|-------|----------------|
| 13 | `.env` | `BETTER_AUTH_SECRET` presence | Confirm it is set — a weak or missing secret invalidates all session security |
| 14 | `lib/actions/org.ts` | `x-forwarded-for` can be spoofed | Extract the last trusted IP: `headerList.get("x-forwarded-for")?.split(",").pop()?.trim()` |
| 15 | `components/ui/image-upload.tsx` | File type not validated on input click | Add `accept="image/jpeg,image/png,image/webp"` to the `<input>` element AND re-validate `file.type` inside `handleUpload` before uploading |
| 16 | `lib/auth/index.tsx` | `sendVerificationOnSignUp: false` | Ensure signup page always triggers the send OTP step immediately — a missed step leaves users stuck unverified |
| 17 | `lib/actions/election.ts` | `CANCELLED` status has no transition logic | Define when/how `CANCELLED` is set before building election pages |

---

## What Is Already Done Well ✅

- All DB writes use `$transaction` — no partial writes possible
- No raw SQL (`$queryRaw` / `$executeRaw`) anywhere in the codebase
- Zod validation on all form-facing server actions
- `AdminAuditLog` created on every org/election mutation
- `UserAuditLog` via Better Auth hooks for login/signup/OTP/OAuth events
- ImageKit auth route is server-gated — session required before issuing upload tokens
- `organizationId` scoping on election update/delete/toggle queries (IDOR protection)
- Cryptographically secure code generation already in `org.ts`
- `requireEmailVerification: true` enforced in Better Auth config
- Google OAuth account linking configured correctly with `trustedProviders`
- `databaseHooks` prevents overwriting existing profile images on OAuth re-link

---

## Fix Priority Order

Work through these in order before moving to election pages:

1. Add role guard to `addMemberAction` — `lib/actions/member.ts`
2. Add role guard to `updateMemberAccess` — `lib/actions/member.ts`
3. Add role guard to `updateOrganizationProfile` — `lib/actions/settings.ts`
4. Scope `requireOrgAdmin` to active org — `lib/actions/election.ts`
5. Verify new owner is org member in transfer action — `lib/actions/settings.ts`
6. Add security headers — `next.config.ts`
7. Enable `rateLimit` in Better Auth config — `lib/auth/index.tsx`
8. Scope `deleteMany` in `updateMemberAccess` to current org — `lib/actions/member.ts`
9. Replace `Math.random()` with `crypto.randomBytes` — `lib/actions/election.ts`
10. Add logo URL validation — `lib/schemas/org.ts`