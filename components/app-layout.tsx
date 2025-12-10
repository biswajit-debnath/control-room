// Shared Application Layout
"use client"

import { useState } from "react"
import { useSession } from "@/components/session-provider"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { LogOut, FileText, Activity, User, LogIn, Users } from "lucide-react"

interface AppLayoutProps {
  children: React.ReactNode
  requireAuth?: boolean // If true, redirects to login when not authenticated
}

export default function AppLayout({ 
  children, 
  requireAuth = false
}: AppLayoutProps) {
  const { user, loading, logout } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if authentication is required and user is not logged in
  if (requireAuth && !user) {
    router.push("/login")
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                Control Room
              </h1>
            </div>

            {/* Desktop User Section */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">
                      {user.role} • {user.phoneNumber}
                    </p>
                  </div>
                  {user ? (
                    <Button variant="outline" size="sm" onClick={logout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  ) : (
                    <Link href="/login">
                      <Button variant="default" size="sm">
                        <LogIn className="h-4 w-4 mr-2" />
                        Login
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <Link href="/login">
                  <Button variant="default" size="sm">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center gap-2 p-2 rounded-md hover:bg-gray-100"
            >
              {user ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium text-gray-900 leading-tight">{user.name}</p>
                    <p className="text-xs text-gray-500 leading-tight">{user.role}</p>
                  </div>
                </>
              ) : (
                <LogIn className="h-5 w-5 text-gray-600" />
              )}
              <svg
                className={`h-5 w-5 text-gray-400 transition-transform ${
                  mobileMenuOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white shadow-lg">
            <div className="px-4 py-3 space-y-1">
              {user && (
                <>
                  <div className="px-3 py-2 text-xs text-gray-500">
                    📱 {user.phoneNumber}
                  </div>
                  <div className="border-t border-gray-200 my-2"></div>
                </>
              )}

              {/* Navigation Links */}
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  pathname === "/dashboard"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Activity className="h-5 w-5" />
                Dashboard
              </Link>
              <Link
                href={user ? "/dg-operations" : "/dg-operations/records"}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  pathname?.startsWith("/dg-operations")
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FileText className="h-5 w-5" />
                DG Operations
              </Link>
              <Link
                href="/dashboard/users"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  pathname === "/dashboard/users"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Users className="h-5 w-5" />
                Users
              </Link>

              <div className="border-t border-gray-200 my-2"></div>

              {/* Login/Logout Button */}
              {user ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    logout()
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors"
                >
                  <LogIn className="h-5 w-5" />
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Desktop Navigation */}
      <nav className="hidden md:block bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 h-14">
            <Link
              href="/dashboard"
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                pathname === "/dashboard"
                  ? "border-blue-500 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Activity className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
            <Link
              href={user ? "/dg-operations" : "/dg-operations/records"}
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                pathname?.startsWith("/dg-operations")
                  ? "border-blue-500 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FileText className="h-4 w-4 mr-2" />
              DG Operations
            </Link>
            <Link
              href="/dashboard/users"
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                pathname === "/dashboard/users"
                  ? "border-blue-500 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Users className="h-4 w-4 mr-2" />
              Users
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
