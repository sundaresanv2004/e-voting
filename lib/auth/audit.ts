import { db } from "@/lib/db";
import { AuditStatus } from "@prisma/client";

export async function logUserAction(ctx: any, status: AuditStatus, errorReason?: string) {
    try {
        const { request, path, body, context } = ctx;
        
        // Define paths we want to track
        const trackedPaths = [
            "/sign-in/email",
            "/sign-up/email",
            "/sign-out",
            "/reset-password",
            "/request-password-reset",
            "/email-otp/verify-email",
            "/email-otp/send-verification-otp",
            "/callback"
        ];
        
        // Check if current path matches any tracked path prefixes
        const actionPath = trackedPaths.find(p => path.startsWith(p));
        if (!actionPath) return; // Not a user action we want to track
        
        const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown";
        const userAgent = request.headers.get("user-agent") || "Unknown";
        
        // Attempt to extract userId and email
        let userId = null;
        let email = null;
        
        // 1. From active session
        if (context?.session?.user) {
            userId = context.session.user.id;
            email = context.session.user.email;
        }
        
        // 2. From successful payload return
        if (!userId && context?.returned?.user) {
            userId = context.returned.user.id;
            email = context.returned.user.email;
        }
        
        // 3. From request body
        if (!email && body?.email) {
            email = body.email;
        }
        
        const actionMap: Record<string, string> = {
            "/sign-in/email": "Email Login",
            "/sign-up/email": "Email Sign Up",
            "/sign-out": "Log Out",
            "/reset-password": "Reset Password",
            "/request-password-reset": "Request Password Reset",
            "/email-otp/verify-email": "Verify Email",
            "/email-otp/send-verification-otp": "Request Verification Email",
            "/callback": "OAuth Login"
        };
        
        const actionString = actionMap[actionPath] || actionPath;

        await db.userAuditLog.create({
            data: {
                userId: userId,
                email: email,
                action: actionString,
                status: status,
                reason: errorReason,
                ipAddress: ipAddress,
                userAgent: userAgent,
                metadata: { path, method: request.method }
            }
        });
    } catch (error) {
        console.error("Failed to log user audit action:", error);
    }
}
