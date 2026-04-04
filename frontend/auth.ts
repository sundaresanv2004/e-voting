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
    async jwt({ token }: any) {
      // 🚀 IMPORTANT: Always re-fetch from the database to ensure the Middleware (Proxy) 
      // has the absolute latest Organization and Role data. 
      // This prevents redirect loops caused by stale JWT tokens (Create/Delete cases).
      if (token.sub) {
        const freshUser = await db.user.findUnique({
          where: { id: token.sub },
          select: { role: true, organizationId: true, emailVerified: true, image: true }
        })
        
        if (freshUser) {
          token.role = freshUser.role
          token.organizationId = freshUser.organizationId
          token.emailVerified = freshUser.emailVerified
          token.image = freshUser.image
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
        session.user.image = token.image as string | null
      }

      return session
    },
    async signIn({ user, account, profile }: any) {
      if (account?.provider === "google") {
        const email = user?.email || profile?.email;
        
        if (email) {
          try {
            // 1. Always ensure email is verified when logging in via Google
            await db.user.updateMany({
              where: { email },
              data: { emailVerified: new Date() }
            });

            // 2. Only sync profile picture if the current database record has NO image
            // This satisfies the user's "if profile is null" requirement precisely.
            if (profile?.picture) {
              await db.user.updateMany({
                where: { 
                  email,
                  OR: [
                    { image: null },
                    { image: "" }
                  ]
                },
                data: { image: profile.picture }
              });
            }
          } catch (error) {
            console.error("Error in signIn callback:", error);
          }
        }
      }
      return true
    },
  },
  events: {
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
      if (user.email) {
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
