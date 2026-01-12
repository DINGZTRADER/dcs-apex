"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { User, Session } from "@supabase/supabase-js"

type UserRole = "DIRECTOR" | "VC" | "FINANCE" | "HR" | "STORE"

interface AuthUser {
  id: string
  email: string
  role: UserRole
}

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => { },
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        if (session?.user) {
          try {
            await fetchUserRole(session.user)
          } catch (e) {
            console.error("Fetch role failed", e)
          }
        }
      } catch (e) {
        console.error("Init auth failed", e)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session?.user) {
        try {
          await fetchUserRole(session.user)
        } catch (e) {
          console.error("Auth change role fetch failed", e)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchUserRole(authUser: User) {
    console.log("Fetching role for user:", authUser.id, authUser.email)

    // Create a timeout promise that rejects after 5 seconds
    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timed out")), 5000);
    });

    try {
      // Wrap the DB calls in a race with the timeout
      await Promise.race([
        (async () => {
          // First try by ID (most secure/correct)
          let { data, error } = await supabase
            .from("User")
            .select("role")
            .eq("id", authUser.id) // Try ID first
            .single()

          // If ID match fails (e.g. legacy data), try email
          if ((error || !data) && authUser.email) {
            console.log("ID match failed, trying email fallback...")
            const emailResult = await supabase
              .from("User")
              .select("role")
              .eq("email", authUser.email)
              .single()

            data = emailResult.data
            error = emailResult.error
          }

          if (error || !data) {
            console.error("Error fetching user role:", error)
            console.log("User details:", authUser)
            setUser(null)
            return
          }

          console.log("Role found:", data.role)

          setUser({
            id: authUser.id,
            email: authUser.email!,
            role: data.role as UserRole,
          })
        })(),
        timeout
      ]);
    } catch (error) {
      console.error("Fetch user role timed out or failed:", error);
      setUser(null);
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
