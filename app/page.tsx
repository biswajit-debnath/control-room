"use client"

import { useEffect } from "react"
import { useSession } from "@/components/session-provider"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const { user, loading } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/dashboard")
      } else {
        router.push("/login")
      }
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading Control Room System...</p>
      </div>
    </div>
  )
}
