import { auth } from "./auth"

export default auth((req: any) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth?.user

  const organizationId = (req.auth?.user as any)?.organizationId
  const hasOrganization = !!organizationId
  const isGoogleUser = (req.auth?.user as any)?.provider === 'google'
  const isEmailVerified = !!(req.auth?.user as any)?.emailVerified || isGoogleUser

  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth')
  const isPublicRoute = ['/', '/terms', '/privacy'].includes(nextUrl.pathname)
  const isAuthRoute = nextUrl.pathname.startsWith('/auth')
  const isVerifyRoute = nextUrl.pathname === '/auth/verify-email'
  const isSetupRoute = nextUrl.pathname.startsWith('/setup')
  const isUserRoute = nextUrl.pathname.startsWith('/user')
  const isAdminRoute = nextUrl.pathname.startsWith('/admin')

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
      const redirectPath = hasOrganization ? '/admin/organization' : '/setup/organization'
      const redirectUrl = new URL(redirectPath, nextUrl)
      
      // Preserve search params
      nextUrl.searchParams.forEach((value, key) => {
        redirectUrl.searchParams.set(key, value)
      })
      
      return Response.redirect(redirectUrl)
    }
    return undefined // Guest can access auth routes
  }

  // 3. Protected route handling
  if (!isLoggedIn) {
    const loginUrl = new URL('/auth/login', nextUrl)
    if (nextUrl.pathname !== '/') {
        loginUrl.searchParams.set('next', nextUrl.pathname)
    }
    return Response.redirect(loginUrl)
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
    if (isSetupRoute || isUserRoute) return undefined // Let them setup or manage their profile
    const setupUrl = new URL('/setup/organization', nextUrl)
    
    // Preserve search params (e.g., logged_in=true)
    nextUrl.searchParams.forEach((value, key) => {
        setupUrl.searchParams.set(key, value)
    })
    
    return Response.redirect(setupUrl)
  }

  // Final Priority: App Access
  // If they have an org but are still on a setup page, nudge them into the app
  if (hasOrganization && isSetupRoute) {
    const adminUrl = new URL('/admin/organization', nextUrl)
    
    // Preserve search params (e.g., logged_in=true or org_created=true)
    nextUrl.searchParams.forEach((value, key) => {
        adminUrl.searchParams.set(key, value)
    })
    
    return Response.redirect(adminUrl)
  }

  return undefined
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
