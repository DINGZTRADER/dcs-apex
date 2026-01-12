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
    const { data, error } = await supabase
      .from("User")
      .select("role")
      .eq("email", authUser.email)
      .single()

    if (error || !data) {
      console.error("Error fetching user role:", error)
      setUser(null)
      return
    }

    setUser({
      id: authUser.id,
      email: authUser.email!,
      role: data.role as UserRole,
    })
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
