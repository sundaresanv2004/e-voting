
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = async () => {
    const cookieStore = await cookies();

    return createServerClient(
        supabaseUrl!,
        supabaseKey!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            const newOptions = { ...options };
                            delete newOptions.maxAge;
                            delete newOptions.expires;
                            cookieStore.set(name, value, newOptions)
                        })
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        },
    );
};

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const createAdminClient = () => {
    return createSupabaseClient(
        supabaseUrl!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );
};
