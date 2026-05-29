import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const protectedRoutes = ["/organisation", "/setup", "/user"];
const authRoutes = ["/auth/login", "/auth/signup", "/auth/forgot-password", "/auth/reset-password", "/auth/verify-email"];

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Always let better-auth handle its own endpoints
    if (pathname.startsWith("/api/auth")) {
        return NextResponse.next();
    }

    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
    const isApiRoute = pathname.startsWith("/api/");

    // Public non-API, non-auth routes — proceed normally
    if (!isProtectedRoute && !isAuthRoute && !isApiRoute) {
        return NextResponse.next();
    }

    // Use the SDK directly — no internal HTTP roundtrip
    const session = await auth.api.getSession({
        headers: request.headers,
    });

    // Unauthenticated access to any /api/* route (except /api/auth handled above)
    if (!session && isApiRoute) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Unauthenticated access to protected page routes
    if (!session && isProtectedRoute) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Logged-in user visiting auth pages → redirect to dashboard
    if (session && isAuthRoute) {
        return NextResponse.redirect(new URL("/organisation", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match ALL request paths except static Next.js assets and metadata files.
         * API routes are now included so we can guard /api/* routes at the edge.
         */
        '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
};
