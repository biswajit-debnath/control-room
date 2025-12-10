// Users Management Page
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface User {
  id: string
  phoneNumber: string
  phoneVerified: boolean
  role: string
  name: string
  createdAt: string
  updatedAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/users")
      const result = await response.json()
      
      if (result.success) {
        setUsers(result.data)
      } else {
        setError(result.error || "Failed to fetch users")
      }
    } catch (err) {
      setError("An error occurred while fetching users")
      console.error("Error fetching users:", err)
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'AE':
        return 'bg-red-500 hover:bg-red-600'
      case 'EOD':
        return 'bg-blue-500 hover:bg-blue-600'
      case 'TA':
        return 'bg-green-500 hover:bg-green-600'
      case 'EA':
        return 'bg-purple-500 hover:bg-purple-600'
      case 'SEA':
        return 'bg-orange-500 hover:bg-orange-600'
      default:
        return 'bg-gray-500 hover:bg-gray-600'
    }
  }

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      AE: 'Admin Executive',
      EOD: 'End of Day Staff',
      TA: 'Technical Assistant',
      EA: 'Executive Assistant',
      SEA: 'Senior Executive Assistant',
    }
    return roleLabels[role] || role
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card className="p-12 border-red-200 bg-red-50">
          <div className="text-center text-red-600">
            <p className="text-lg font-semibold">Error</p>
            <p className="mt-2">{error}</p>
            <button
              onClick={fetchUsers}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Users Management</h1>
          <p className="text-muted-foreground mt-1">
            View all registered users in the system
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Total Users: {users.length}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-xl">{user.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {user.phoneNumber}
                  </p>
                </div>
                <Badge className={getRoleBadgeColor(user.role)}>
                  {user.role}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role:</span>
                  <span className="font-medium">{getRoleLabel(user.role)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone Verified:</span>
                  <span className="font-medium">
                    {user.phoneVerified ? (
                      <span className="text-green-600">✓ Yes</span>
                    ) : (
                      <span className="text-red-600">✗ No</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Joined:</span>
                  <span className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <p className="text-lg">No users found in the system.</p>
            <p className="mt-2">Run the seed script to create initial users.</p>
          </div>
        </Card>
      )}
    </div>
  )
}
