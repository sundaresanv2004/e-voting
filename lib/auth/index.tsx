import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization, admin, emailOTP, twoFactor } from "better-auth/plugins";
import { db } from "../db";
import { sendEmail } from "../email";
import VerificationEmail from "@/emails/VerificationEmail";
import ResetPasswordEmail from "@/emails/ResetPasswordEmail";
import PasswordResetSuccessEmail from "@/emails/PasswordResetSuccessEmail";
import LoginAlertEmail from "@/emails/LoginAlertEmail";
import { UAParser } from "ua-parser-js";
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
    async sendResetPassword({ user, url }: any, request?: any) {
      await sendEmail({
        to: user.email,
        subject: "Reset your password – e-voting",
        react: <ResetPasswordEmail resetPasswordLink={url} userName={user.name} />,
      });
    },
    async onPasswordReset({ user }: any, request?: any) {
      void sendEmail({
        to: user.email,
        subject: "Your password has been changed – e-voting",
        react: <PasswordResetSuccessEmail userName={user.name} />,
      });
    },
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
    },
    session: {
      create: {
        after: async (session, request) => {
          // Automatically restore activeOrganizationId if the user belongs to an org
          if (!session.activeOrganizationId && session.userId) {
            const member = await db.member.findFirst({
              where: { userId: session.userId }
            });
            if (member) {
              await db.session.update({
                where: { id: session.id },
                data: { activeOrganizationId: member.organizationId }
              });
            }
          }

          // Send login alert email (fire-and-forget)
          void (async () => {
            try {
              const user = await db.user.findUnique({ where: { id: session.userId } });
              if (!user) return;

              // Parse User-Agent for browser/OS info
              const uaString = request?.headers?.get?.("user-agent") ?? "Unknown";
              const parser = new UAParser(uaString);
              const browser = parser.getBrowser().name ?? "Unknown Browser";
              const os = `${parser.getOS().name ?? "Unknown OS"} ${parser.getOS().version ?? ""}`.trim();

              // Get IP address (handles proxies via common headers)
              const ip =
                request?.headers?.get?.("x-real-ip")?.trim() ??
                request?.headers?.get?.("x-forwarded-for")?.split(",")?.[0]?.trim() ??
                "Unknown IP";

              // Attempt to resolve location
              let location = "Unknown Location";
              const city = request?.headers?.get?.("x-vercel-ip-city");
              const country = request?.headers?.get?.("x-vercel-ip-country");

              if (city && country) {
                location = `${decodeURIComponent(city)}, ${country}`;
              } else if (ip !== "Unknown IP" && ip !== "127.0.0.1" && ip !== "::1") {
                try {
                  const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,country`);
                  const geoData = await geoRes.json();
                  if (geoData.status === "success") {
                    location = `${geoData.city}, ${geoData.country}`;
                  }
                } catch (e) {
                  // Silently ignore geo-ip fetch errors
                }
              }

              // Determine login method from the account linked to this user
              const account = await db.account.findFirst({
                where: { userId: user.id },
                orderBy: { createdAt: "desc" },
              });
              const loginMethod = (account?.providerId === "google" ? "google" : "email") as "email" | "google";

              await sendEmail({
                to: user.email,
                subject: "New sign-in to your e-voting account",
                react: <LoginAlertEmail
                  userName={user.name}
                  loginMethod={loginMethod}
                  browser={browser}
                  os={os}
                  ipAddress={ip}
                  location={location}
                  loginTime={new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })}
                />,
              });
            } catch (err) {
              console.error("[login-alert] Failed to send login alert email:", err);
            }
          })();
        }
      }
    }
  },
  plugins: [
    organization({
      creatorRole: "org_admin",
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
          const user = await db.user.findUnique({ where: { email } });
          await sendEmail({
            to: email,
            subject: "Verify your email address – e-voting",
            react: <VerificationEmail otp={otp} userName={user?.name} />,
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
