import NextAuth from "next-auth"
import authConfig from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req: any) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth?.user
  const hasOrganization = !!(req.auth?.user as any)?.organizationId

  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth')
  const isPublicRoute = ['/', '/terms', '/privacy'].includes(nextUrl.pathname)
  const isAuthRoute = nextUrl.pathname.startsWith('/auth')
  const isSetupRoute = nextUrl.pathname.startsWith('/setup')

  if (isApiAuthRoute) return undefined

  if (isAuthRoute) {
    if (isLoggedIn) {
      const redirectUrl = hasOrganization ? '/dashboard' : '/setup/organization'
      return Response.redirect(new URL(redirectUrl, nextUrl))
    }
    return undefined
  }

  if (!isLoggedIn && !isPublicRoute && !isAuthRoute) {
    return Response.redirect(new URL('/auth/login', nextUrl))
  }

  if (isLoggedIn && !hasOrganization && !isSetupRoute && !isPublicRoute) {
    return Response.redirect(new URL('/setup/organization', nextUrl))
  }

  return undefined
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
