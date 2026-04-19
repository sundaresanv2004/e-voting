import { UserRole } from "@prisma/client"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      role: UserRole
      organizationId: string | null
      emailVerified: Date | null
      isActive?: boolean
    } & DefaultSession["user"]
  }

  interface User {
    role: UserRole
    organizationId: string | null
    emailVerified?: Date | null
    isActive?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole
    organizationId?: string | null
    emailVerified?: Date | null
    isActive?: boolean
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    role: UserRole
    organizationId: string | null
    emailVerified: Date | null
  }
}
