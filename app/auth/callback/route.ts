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
    }

    // If there's an error or no code, redirect to login
    return NextResponse.redirect(new URL('/auth/login?error=verification_failed', request.url))
}
