import { auth } from "./auth"

export default auth((req: any) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth?.user
  const hasOrganization = !!(req.auth?.user as any)?.organizationId
  const isEmailVerified = !!(req.auth?.user as any)?.emailVerified

  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth')
  const isPublicRoute = ['/', '/terms', '/privacy'].includes(nextUrl.pathname)
  const isAuthRoute = nextUrl.pathname.startsWith('/auth')
  const isVerifyRoute = nextUrl.pathname === '/auth/verify-email'
  const isSetupRoute = nextUrl.pathname.startsWith('/setup')

  // 1. Allow API Auth routes
  if (isApiAuthRoute) return undefined

  // 2. Public and Auth-page handling
  if (isPublicRoute) return undefined
  
  if (isAuthRoute) {
    if (isLoggedIn) {
      // If unverified, they MUST be on verify-email. If they already are, don't redirect.
      if (!isEmailVerified) {
        if (isVerifyRoute) return undefined
        const verifyUrl = new URL('/auth/verify-email', nextUrl)
        verifyUrl.searchParams.set('email', (req.auth?.user as any)?.email)
        verifyUrl.searchParams.set('resend', 'true')
        return Response.redirect(verifyUrl)
      }
      
      // If verified, they shouldn't be on any auth page (login, signup, verify-email)
      const redirectUrl = hasOrganization ? '/dashboard' : '/setup/organization'
      return Response.redirect(new URL(redirectUrl, nextUrl))
    }
    return undefined // Guest can access auth routes
  }

  // 3. Protected route handling
  if (!isLoggedIn) {
    return Response.redirect(new URL('/auth/login', nextUrl))
  }

  // 4. Authenticated-but-needs-action handling
  
  // High Priority: Email Verification
  if (!isEmailVerified) {
    if (isVerifyRoute) return undefined // Already handled above in isAuthRoute, but here for safety
    const verifyUrl = new URL('/auth/verify-email', nextUrl)
    verifyUrl.searchParams.set('email', (req.auth?.user as any)?.email)
    verifyUrl.searchParams.set('resend', 'true')
    return Response.redirect(verifyUrl)
  }

  // Next Priority: Organization Setup
  if (!hasOrganization) {
    if (isSetupRoute) return undefined // Let them setup
    return Response.redirect(new URL('/setup/organization', nextUrl))
  }

  // Final Priority: Dashboard/App Access
  // If they have an org but are still on a setup page, nudge them into the app
  if (hasOrganization && isSetupRoute) {
    return Response.redirect(new URL('/dashboard', nextUrl))
  }

  return undefined
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
