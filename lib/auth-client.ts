import { createAuthClient } from "better-auth/react";
import { organizationClient, adminClient, emailOTPClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    organizationClient(),
    adminClient(),
    emailOTPClient()
  ]
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
