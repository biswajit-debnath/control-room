// Session Provider Component
"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type User = {
  id: string
  name: string
  phoneNumber: string
  role: "TA" | "EOD" | "AE" | "SEA" | "EA"
} | null

type SessionContextType = {
  user: User
  loading: boolean
  login: (phoneNumber: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const refreshSession = async () => {
    try {
      const res = await fetch("/api/session")
      const data = await res.json()
      setUser(data.user || null)
    } catch (error) {
      console.error("Failed to fetch session:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshSession()
  }, [])

  const login = async (phoneNumber: string, password: string) => {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber, password }),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || "Login failed")
    }

    const data = await res.json()
    
    // Set session cookie
    document.cookie = `session=${data.session.token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=strict`
    
    setUser(data.user)
    router.push("/dashboard")
  }

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" })
    document.cookie = "session=; path=/; max-age=0"
    setUser(null)
    router.push("/login")
  }

  return (
    <SessionContext.Provider
      value={{ user, loading, login, logout, refreshSession }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider")
  }
  return context
}
