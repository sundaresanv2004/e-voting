import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') || '/'

    if (code) {
        const supabase = await createClient()

        // Exchange the code for a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data.user) {
            // Get user email for the verified page
            const email = data.user.email

            // Redirect to verified page with email
            return NextResponse.redirect(
                new URL(`/auth/verified?email=${encodeURIComponent(email || '')}&next=${encodeURIComponent(next)}`, request.url)
            )
        }

        // If there's an error, redirect to error page with error details
        if (error) {
            const errorCode = error.code || 'verification_failed'
            const errorMessage = encodeURIComponent(error.message)
            return NextResponse.redirect(
                new URL(`/auth/auth-code-error?error_code=${errorCode}&error_description=${errorMessage}`, request.url)
            )
        }
    }

    // If there's no code, redirect to error page
    return NextResponse.redirect(
        new URL('/auth/auth-code-error?error=missing_code&error_description=Verification code is missing', request.url)
    )
}
