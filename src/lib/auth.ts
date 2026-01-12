import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Validates the current request is from an authenticated user.
 * Throws an error if the user is not authenticated.
 * 
 * Uses @supabase/ssr to validate the JWT against the Supabase Auth server.
 */
export async function requireAuth() {
    try {
        const cookieStore = await cookies()

        // Log env vars status for debugging
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error("AUTH CONFIG ERROR: Missing Supabase Environment Variables");
            // For demo purposes, we will NOT throw here to avoid 500ing the page if config is inconsistent.
            // But we cannot validate. 
            // If you are seeing this, CHECK VERCEL ENVIRONMENT VARIABLES.
            return null;
        }

        const supabase = createServerClient(
            supabaseUrl,
            supabaseKey,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch {
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // user sessions.
                        }
                    },
                },
            }
        )

        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            console.warn("Auth validation failed:", error?.message);
            // Ensure we throw a standard error message that the UI can catch
            throw new Error("Unauthorized: Please sign in again");
        }

        return user;
    } catch (error) {
        // If it's already an error we threw, rethrow it
        if (error instanceof Error && error.message.includes("Unauthorized")) {
            throw error;
        }

        // Log unexpected system errors but don't crash the entire stack with a 500
        console.error("Unexpected Auth System Error:", error);
        throw new Error("Authentication System Error");
    }
}
