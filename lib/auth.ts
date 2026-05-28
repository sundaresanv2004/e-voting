import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization, admin } from "better-auth/plugins";
import { db } from "./db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    async sendVerificationEmail({ user, url, token }, request) {
      await resend.emails.send({
        from: "Acme <onboarding@resend.dev>", // Change this in production
        to: user.email,
        subject: "Verify your email address",
        // React email template will be imported and used here later
        html: `<a href="${url}">Verify Email</a>`,
      });
    },
    async sendResetPassword({ user, url, token }, request) {
      await resend.emails.send({
        from: "Acme <onboarding@resend.dev>", // Change this in production
        to: user.email,
        subject: "Reset your password",
        // React email template will be imported and used here later
        html: `<a href="${url}">Reset Password</a>`,
      });
    }
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }
  },
  plugins: [
    organization(),
    admin()
  ]
});

export type Session = typeof auth.$Infer.Session;
