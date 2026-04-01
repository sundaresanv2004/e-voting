import NextAuth from "next-auth"
import authConfig from "./auth.config"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

import { UserRole } from "@prisma/client"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 1 * 60 * 60, // 1 hour
  },
  callbacks: {
    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.role = user.role
        token.organizationId = user.organizationId
        token.emailVerified = user.emailVerified
        console.log("JWT Callback (Initial) - User ID:", user.id, "Org ID:", user.organizationId);
      }
      
      if (trigger === "update") {
        if (token.sub) {
          const freshUser = await db.user.findUnique({
            where: { id: token.sub },
            select: { role: true, organizationId: true, emailVerified: true }
          })
          
          console.log("JWT Callback (Update) - Fresh User Org ID:", freshUser?.organizationId);
          
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
      if (account?.provider === "credentials") {
        return true
      }
      return true
    },
  },
  logger: {
    error(error: Error) {
      if (error?.name === "CredentialsSignin") {
        return
      }
      console.error(error)
    },
  },
  providers: [
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
    })
  ],
})
