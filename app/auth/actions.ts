'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export type AuthResult = {
    success: boolean
    error?: string
    code?: string
    data?: any
}

/**
 * Sign up a new user with email and password
 * Sends verification email with redirect to /auth/verified
 */
export async function signUp(formData: FormData): Promise<AuthResult> {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string

    if (!email || !password) {
        return { success: false, error: 'Email and password are required' }
    }

    const supabase = await createClient()

    // Get the origin for the email redirect URL
    const headersList = await headers()
    const origin = headersList.get('origin') || 'http://localhost:3000'

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
            data: {
                full_name: name,
            },
        },
    })

    if (error) {
        // Check for duplicate email error
        if (error.message.toLowerCase().includes('already registered') ||
            error.message.toLowerCase().includes('already exists') ||
            error.code === 'user_already_exists') {
            return {
                success: false,
                error: 'An account with this email already exists. Please login instead.'
            }
        }
        return { success: false, error: error.message }
    }

    // Supabase may return a user without error even if email exists (security feature)
    // Check if user was created vs already exists
    if (data.user && data.user.identities && data.user.identities.length === 0) {
        return {
            success: false,
            error: 'An account with this email already exists. Please login instead.'
        }
    }

    // Check if email confirmation is required
    if (data.user && !data.session) {
        // Email confirmation is required - redirect to verify-email page
        redirect(`/auth/verify-email?email=${encodeURIComponent(email)}`)
    }

    // If we have a session, email confirmation is disabled - redirect to home
    if (data.session) {
        redirect('/')
    }

    return { success: true, data }
}

/**
 * Resend verification email to user
 */
export async function resendVerificationEmail(email: string): Promise<AuthResult> {
    if (!email) {
        return { success: false, error: 'Email is required' }
    }

    const supabase = await createClient()

    // Get the origin for the email redirect URL
    const headersList = await headers()
    const origin = headersList.get('origin') || 'http://localhost:3000'

    const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
        },
    })

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true }
}

/**
 * Sign in user with email and password
 */
export async function signIn(formData: FormData): Promise<AuthResult> {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { success: false, error: 'Email and password are required' }
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        // Provide user-friendly error messages
        // Note: We don't reveal if email exists for security reasons
        if (error.message.toLowerCase().includes('invalid login credentials')) {
            return {
                success: false,
                error: 'Invalid email or password. Please try again.',
                code: 'INVALID_CREDENTIALS' // Generic - don't reveal if email exists
            }
        }
        if (error.message.toLowerCase().includes('email not confirmed')) {
            return {
                success: false,
                error: 'Please verify your email before logging in. Check your inbox for the verification link.',
                code: 'EMAIL_NOT_CONFIRMED'
            }
        }
        return { success: false, error: error.message }
    }

    // Get redirect param if exists
    const nextUrl = formData.get('next') as string | null

    // Redirect to the next URL or home
    redirect(nextUrl || '/')
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<AuthResult> {
    const supabase = await createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
        return { success: false, error: error.message }
    }

    redirect('/auth/login')
}

/**
 * Sign in with Google OAuth
 * Redirects to Google consent screen
 */
export async function signInWithGoogle(): Promise<AuthResult> {
    const supabase = await createClient()
    const headersList = await headers()
    const origin = headersList.get('origin') || 'http://localhost:3000'

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${origin}/auth/callback`,
        }
    })

    if (error) {
        return { success: false, error: error.message }
    }

    // Redirect to Google OAuth consent screen
    if (data.url) {
        redirect(data.url)
    }

    return { success: true }
}


/**
 * Update user email (requires re-verification)
 */
export async function updateEmail(newEmail: string): Promise<AuthResult> {
    if (!newEmail) {
        return { success: false, error: 'Email is required' }
    }

    const supabase = await createClient()

    // Get the origin for the email redirect URL
    const headersList = await headers()
    const origin = headersList.get('origin') || 'http://localhost:3000'

    const { data, error } = await supabase.auth.updateUser(
        { email: newEmail },
        {
            emailRedirectTo: `${origin}/auth/callback`,
        }
    )

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true, data }
}
