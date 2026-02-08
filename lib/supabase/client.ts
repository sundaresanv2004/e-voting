
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Custom storage adapter that uses sessionStorage instead of localStorage
 * This ensures sessions are cleared when the browser/tab is closed
 * Important for secure applications like e-voting
 */
const sessionStorageAdapter = {
    getItem: (key: string) => {
        if (typeof window !== 'undefined') {
            return sessionStorage.getItem(key)
        }
        return null
    },
    setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem(key, value)
        }
    },
    removeItem: (key: string) => {
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem(key)
        }
    },
}

export const createClient = () =>
    createBrowserClient(
        supabaseUrl!,
        supabaseKey!,
        {
            auth: {
                storage: sessionStorageAdapter,
                autoRefreshToken: true,
                persistSession: true, // Still persist within the session
                detectSessionInUrl: true,
            },
        }
    );

