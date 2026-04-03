import NextAuth from "next-auth"
import authConfig from "./auth.config"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { sendWelcomeEmail } from "@/lib/mail"

import { UserRole } from "@prisma/client"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
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
          return null
        }

        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (passwordsMatch) {
          return user
        }

        return null
      }
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger }: any) {
      if (user) {
        token.role = user.role
        token.organizationId = user.organizationId
        token.emailVerified = user.emailVerified
      }
      
      // Re-fetch from DB on explicit update, or whenever key fields are missing.
      // This ensures the middleware always has fresh data (no race conditions).
      if (trigger === "update" || !token.organizationId || token.emailVerified === undefined) {
        if (token.sub) {
          const freshUser = await db.user.findUnique({
            where: { id: token.sub },
            select: { role: true, organizationId: true, emailVerified: true }
          })
          if (freshUser) {
            token.role = freshUser.role
            token.organizationId = freshUser.organizationId
            token.emailVerified = freshUser.emailVerified
          }
        }
      }
      
      return token
    },
    async session({ session, token }: any) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }

      if (token.role && session.user) {
        session.user.role = token.role as UserRole
      }

      if (token.organizationId && session.user) {
        session.user.organizationId = token.organizationId as string
      }

      if (session.user) {
        session.user.emailVerified = token.emailVerified as Date | null
      }

      return session
    },
    async signIn({ user, account }: any) {
      // For Google OAuth: always allow sign-in.
      // We use updateMany (not update) so it doesn't throw if the user
      // doesn't exist yet when signIn callback fires for brand-new users.
      // The Prisma adapter creates the user record just after this callback.
      if (account?.provider === "google") {
        if (user?.email) {
          await db.user.updateMany({
            where: { email: user.email },
            data: { emailVerified: new Date() }
          })
        }
        return true
      }
      return true
    },
  },
  // Use the linkAccount event to catch brand-new Google users
  // (fires AFTER the adapter creates the user and account records).
  events: {
    async linkAccount({ user, account }) {
      if (account.provider === "google" && user.email) {
        await db.user.update({
          where: { email: user.email },
          data: { emailVerified: new Date() }
        })
      }
    },
    async createUser({ user }) {
      if (user.email) {
        // Ensure we only send this for OAuth registrations (password is null)
        // Credentials registration handles its own welcome email to prevent duplicates.
        const dbUser = await db.user.findUnique({ where: { email: user.email } })
        if (dbUser && !dbUser.password) {
          await sendWelcomeEmail(user.email, user.name || "User")
        }
      }
    }
  },
  logger: {
    error(error: Error) {
      if (error?.name === "CredentialsSignin") {
        return
      }
      console.error(error)
    },
  },
})
