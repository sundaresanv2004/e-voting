import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization, admin, emailOTP, twoFactor } from "better-auth/plugins";
import { db } from "../db";
import { sendEmail } from "../email";
import VerificationEmail from "@/emails/VerificationEmail";
import ResetPasswordEmail from "@/emails/ResetPasswordEmail";
import { logUserAction } from "./audit";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  session: {
    expiresIn: 60 * 60 * 1, // 1 hours
    updateAge: 60 * 15, // Update expiration every 15 min
  },
  rateLimit: {
    window: 15 * 60, // 15 minutes
    max: 100,
    customRules: {
      '/sign-in/email': { window: 15 * 60, max: 5 }, // 5 attempts per 15 min
      '/sign-up/email': { window: 15 * 60, max: 5 },
      '/forget-password': { window: 15 * 60, max: 5 },
    }
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      await logUserAction(ctx, "SUCCESS");
    })
  },
  advanced: {
    cookiePrefix: "evote",
    cookies: {
      session_token: {
        attributes: {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax" as const,
          path: "/",
          // No maxAge — becomes a browser session cookie (expires on close)
        }
      }
    }
  },
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
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      updateUserInfoOnLink: true,
    }
  },
  databaseHooks: {
    user: {
      update: {
        before: async (user) => {
          // If an image is provided in the update, check if we should keep it
          // Based on user feedback, we prevent overwriting an existing image
          // until the custom profile upload feature is built.
          if (user.image && typeof user.id === 'string') {
            const existingUser = await db.user.findUnique({ where: { id: user.id } });
            if (existingUser?.image) {
              // Delete the incoming image so the existing one is preserved
              delete user.image;
            }
          }
          return { data: user };
        }
      }
    }
  },
  plugins: [
    organization({
      schema: {
        organization: {
          additionalFields: {
            code: {
              type: "string",
              required: true
            },
            type: {
              type: "string",
              required: true
            }
          }
        }
      }
    }),
    admin(),
    twoFactor(),
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
      sendVerificationOnSignUp: false,
    })
  ],
  onAPIError: {
    errorURL: "/auth/error",
    onError: async (error, ctx) => {
      const message = error instanceof Error ? error.message : String(error);
      await logUserAction(ctx, "FAILURE", message);
    }
  }
});

export type Session = typeof auth.$Infer.Session;
