import NextAuth, { CredentialsSignin } from "next-auth"
import type { Account, Profile, Session, User } from "next-auth"
import type { JWT } from "next-auth/jwt"
import authConfig from "./auth.config"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { sendWelcomeEmail, sendLoginNotificationEmail } from "@/lib/mail"
import { headers } from "next/headers"

import { UserRole, AuditStatus } from "@prisma/client"

const MAX_FAILED_LOGIN_ATTEMPTS = 5
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000

class AccountLockedError extends CredentialsSignin {
  constructor() {
    super()
    this.code = "AccountLocked"
  }
}


type AppJWT = JWT & {
  provider?: string
  role?: UserRole
  organizationId?: string | null
  emailVerified?: Date | null
  isActive?: boolean
  image?: string | null
}

type AppSession = Session & {
  user?: Session["user"] & {
    id?: string
    role?: UserRole
    organizationId?: string | null
    emailVerified?: Date | null
    provider?: string
    isActive?: boolean
  }
}

type GoogleProfile = {
  email?: string
  emailVerified?: boolean
  picture?: string
}

const googleAllowedDomains = (process.env.GOOGLE_ALLOWED_DOMAINS || "")
  .split(",")
  .map((domain) => domain.trim().toLowerCase().replace(/^@/, ""))
  .filter(Boolean)

function getGoogleProfile(profile: Profile | undefined): GoogleProfile {
  const source = (profile || {}) as Record<string, unknown>
  const email = typeof source.email === "string" ? source.email : undefined
  const picture = typeof source.picture === "string" ? source.picture : undefined
  const emailVerified =
    source.email_verified === true ||
    source.email_verified === "true"

  return { email, emailVerified, picture }
}

function isGoogleEmailVerified(profile: Profile | undefined) {
  const googleProfile = getGoogleProfile(profile)
  return googleProfile.emailVerified === true
}

function isAllowedGoogleDomain(email: string) {
  if (googleAllowedDomains.length === 0) return true

  const domain = email.split("@")[1]?.toLowerCase()
  return !!domain && googleAllowedDomains.includes(domain)
}

async function auditOAuthFailure(
  email: string | null | undefined,
  reason: string,
  metadata?: Record<string, unknown>
) {
  const headerList = await headers()
  const ip = headerList.get("x-forwarded-for") || "unknown"
  const userAgent = headerList.get("user-agent") || "unknown"

  await db.userAuditLog.create({
    data: {
      email,
      action: "LOGIN",
      status: AuditStatus.FAILURE,
      reason,
      ipAddress: ip,
      userAgent,
      metadata: {
        provider: "google",
        ...metadata,
      },
    },
  })
}

async function getRequestContext() {
  const headerList = await headers()
  return {
    ipAddress: headerList.get("x-forwarded-for") || "unknown",
    userAgent: headerList.get("user-agent") || "unknown",
  }
}

function isAccountLocked(lockedUntil: Date | null) {
  return !!lockedUntil && lockedUntil.getTime() > Date.now()
}

async function auditCredentialLoginFailure(data: {
  userId?: string
  email: string
  reason: string
  failedLoginCount?: number
  lockedUntil?: Date | null
}) {
  const { ipAddress, userAgent } = await getRequestContext()

  await db.userAuditLog.create({
    data: {
      userId: data.userId,
      email: data.email,
      action: "LOGIN",
      status: AuditStatus.FAILURE,
      reason: data.reason,
      ipAddress,
      userAgent,
      metadata: {
        provider: "credentials",
        failedLoginCount: data.failedLoginCount,
        lockedUntil: data.lockedUntil,
      },
    },
  })
}

async function recordFailedCredentialLogin(user: {
  id: string
  email: string
  failedLoginCount: number
  lockedUntil: Date | null
}) {
  const now = new Date()
  const isLockoutExpired = user.lockedUntil && user.lockedUntil.getTime() < now.getTime()
  const previousCount = isLockoutExpired ? 0 : user.failedLoginCount
  const failedLoginCount = previousCount + 1
  const lockedUntil =
    failedLoginCount >= MAX_FAILED_LOGIN_ATTEMPTS
      ? new Date(now.getTime() + LOGIN_LOCKOUT_MS)
      : null

  await db.user.update({
    where: { id: user.id },
    data: {
      failedLoginCount,
      lockedUntil,
      lastFailedLoginAt: now,
    },
  })

  await auditCredentialLoginFailure({
    userId: user.id,
    email: user.email,
    reason: lockedUntil ? "Account locked after repeated failed login attempts" : "Invalid password",
    failedLoginCount,
    lockedUntil,
  })

  return lockedUntil
}


export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 1 * 60 * 60, // 1 hour
  },
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user || !user.password) {
          await auditCredentialLoginFailure({
            email: credentials.email as string,
            reason: "User not found or no password set",
          })
          return null
        }

        if (!user.isActive) {
          await auditCredentialLoginFailure({
            userId: user.id,
            email: user.email,
            reason: "Account is inactive",
          })
          return null
        }

        if (isAccountLocked(user.lockedUntil)) {
          await auditCredentialLoginFailure({
            userId: user.id,
            email: user.email,
            reason: "Account is temporarily locked",
            failedLoginCount: user.failedLoginCount,
            lockedUntil: user.lockedUntil,
          })
          throw new AccountLockedError()
        }

        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (passwordsMatch) {
          await db.user.update({
            where: { id: user.id },
            data: {
              failedLoginCount: 0,
              lockedUntil: null,
              lastLoginAt: new Date(),
            },
          })
          return user
        }

        const lockedUntil = await recordFailedCredentialLogin(user)

        if (lockedUntil) {
          throw new AccountLockedError()
        }

        return null
      }
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, account }: {
      token: JWT
      account?: Account | null
    }) {
      const appToken = token as AppJWT
      if (account) {
        appToken.provider = account.provider
      }

      // 1. Initial sign-in: Enrich token with Google verification status
      if (account?.provider === "google") {
        appToken.emailVerified = new Date()
      }

      // 2. Continuous Sync: Always re-fetch from the database to ensure the Middleware (Proxy) 
      // has the absolute latest Organization and Role data. 
      // This prevents redirect loops caused by stale JWT tokens (Create/Delete cases).
      if (appToken.sub) {
        const freshUser = await db.user.findUnique({
          where: { id: appToken.sub },
          select: { name: true, role: true, organizationId: true, emailVerified: true, image: true, isActive: true }
        })
        
        if (freshUser) {
          appToken.name = freshUser.name
          appToken.role = freshUser.role
          appToken.organizationId = freshUser.organizationId
          appToken.emailVerified = freshUser.emailVerified || (appToken.provider === "google" ? new Date() : null)
          appToken.image = freshUser.image
          appToken.isActive = freshUser.isActive
        } else {
          appToken.isActive = false
        }
      }
      
      return appToken
    },
    async session({ session, token }: {
      session: Session
      token: JWT
    }) {
      const appSession = session as AppSession
      const appToken = token as AppJWT

      if (appToken.sub && appSession.user) {
        appSession.user.id = appToken.sub
      }

      if (appToken.name && appSession.user) {
        appSession.user.name = appToken.name as string
      }

      if (appToken.role && appSession.user) {
        appSession.user.role = appToken.role as UserRole
      }

      if (appSession.user) {
        appSession.user.organizationId = appToken.organizationId ?? null
        appSession.user.emailVerified = appToken.emailVerified as Date | null
        appSession.user.image = appToken.image as string | null
        appSession.user.provider = appToken.provider as string
        appSession.user.isActive = appToken.isActive as boolean | undefined
      }

      return appSession
    },
    async signIn({ user, account, profile }: {
      user: User
      account?: Account | null
      profile?: Profile
    }) {
      if (account?.provider === "google") {
        const googleProfile = getGoogleProfile(profile)
        const email = user?.email || googleProfile.email

        if (!email) {
          await auditOAuthFailure(null, "Google account did not provide an email")
          return "/auth/error?error=OAuthMissingEmail"
        }

        if (!isGoogleEmailVerified(profile)) {
          await auditOAuthFailure(email, "Google email is not verified")
          return "/auth/error?error=OAuthEmailUnverified"
        }

        if (!isAllowedGoogleDomain(email)) {
          await auditOAuthFailure(email, "Google email domain is not allowed", {
            allowedDomains: googleAllowedDomains,
          })
          return "/auth/error?error=OAuthDomainDenied"
        }

        try {
          const existingUser = await db.user.findUnique({
            where: { email },
            select: {
              id: true,
              isActive: true,
              accounts: {
                where: { provider: "google" },
                select: { provider: true },
              },
            }
          })

          if (existingUser && !existingUser.isActive) {
            await auditOAuthFailure(email, "Account is inactive", {
              userId: existingUser.id,
            })
            return "/auth/error?error=AccessDenied"
          }

          if (existingUser && existingUser.accounts.length === 0) {
            await auditOAuthFailure(email, "Google auto-linking blocked for existing account", {
              userId: existingUser.id,
            })
            return "/auth/error?error=OAuthAccountNotLinked"
          }

          await db.user.updateMany({
            where: { email },
            data: { emailVerified: new Date() }
          })

          if (googleProfile.picture) {
            await db.user.updateMany({
              where: {
                email,
                OR: [
                  { image: null },
                  { image: "" }
                ]
              },
              data: { image: googleProfile.picture }
            })
          }
        } catch (error) {
          console.error("Error in signIn callback:", error)
          return "/auth/error?error=Default"
        }
      }
      return true
    },
  },
  events: {
    async signIn({ user, account }) {
      const headerList = await headers()
      const ip = headerList.get("x-forwarded-for") || "unknown"
      const userAgent = headerList.get("user-agent") || "unknown"

      await db.userAuditLog.create({
        data: {
          userId: user.id,
          email: user.email,
          action: "LOGIN",
          status: AuditStatus.SUCCESS,
          ipAddress: ip,
          userAgent: userAgent,
          metadata: { provider: account?.provider || "credentials" }
        }
      })

      if (user.email) {
        await sendLoginNotificationEmail(
            user.email, 
            user.name || "User", 
            ip, 
            userAgent
        )
      }
    },
    async linkAccount({ user, account }) {
      if (account.provider === "google" && user.email) {
        try {
          // Sync verification status and profile image during the account linking event
          // This event is specifically triggered when an existing account joins with Google
          await db.user.updateMany({
            where: { 
              email: user.email,
              OR: [
                { image: null },
                { image: "" }
              ]
            },
            data: { 
              emailVerified: new Date(),
              // Note: user.image is the image from the provider at this point if they just linked it
              ...(user.image && { image: user.image })
            }
          });
        } catch (error) {
          console.error("Error in linkAccount event:", error);
        }
      }
    },
    async createUser({ user }) {
      await db.userAuditLog.create({
        data: {
          userId: user.id,
          email: user.email,
          action: "ACCOUNT_CREATE",
          status: AuditStatus.SUCCESS,
          metadata: { provider: "credentials" }
        }
      })

      if (user.email) {
        const dbUser = await db.user.findUnique({ where: { email: user.email } })
        if (dbUser && !dbUser.password) {
          await sendWelcomeEmail(user.email, user.name || "User")
        }
      }
    }
  },
  logger: {
    error(error: any) {
      if (error?.name === "CredentialsSignin" || error?.code === "AccountLocked" || error?.name === "AccountLockedError") {
        return
      }
      console.error(error)
    },
  },
})
