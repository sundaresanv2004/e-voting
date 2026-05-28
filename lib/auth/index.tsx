import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization, admin, emailOTP } from "better-auth/plugins";
import { db } from "../db";
import { sendEmail } from "../email";
import VerificationEmail from "@/emails/VerificationEmail";
import ResetPasswordEmail from "@/emails/ResetPasswordEmail";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    async sendResetPassword({ user, url, token }: any, request?: any) {
      // Continue to use link-based flow for reset password for now
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        react: <ResetPasswordEmail resetPasswordLink={url} />,
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
    admin(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          await sendEmail({
            to: email,
            subject: "Verify your email address",
            react: <VerificationEmail otp={otp} />,
          });
        }
      },
      overrideDefaultEmailVerification: true,
      sendVerificationOnSignUp: true,
    })
  ],
  onAPIError: {
    errorURL: "/auth/error",
  }
});

export type Session = typeof auth.$Infer.Session;
