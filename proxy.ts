import { NextResponse, type NextRequest } from "next/server";
import { betterFetch } from "@better-fetch/fetch";

const protectedRoutes = ["/organisation", "/setup", "/user"];
const authRoutes = ["/auth/login", "/auth/signup", "/auth/forgot-password", "/auth/reset-password", "/auth/verify-email"];

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Check if the route is protected or an auth route
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

    // If it's neither, proceed as normal
    if (!isProtectedRoute && !isAuthRoute) {
        return NextResponse.next();
    }

    // Check for the user's session
    const { data: session } = await betterFetch<any>(
        "/api/auth/get-session",
        {
            baseURL: request.nextUrl.origin,
            headers: {
                // Pass the cookie to the API route so it can check the session
                cookie: request.headers.get("cookie") || "",
            },
        },
    );

    // If user is not logged in and tries to access a protected route
    if (!session && isProtectedRoute) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // If user is logged in and tries to access an auth route
    if (session && isAuthRoute) {
        return NextResponse.redirect(new URL("/organisation", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
};
