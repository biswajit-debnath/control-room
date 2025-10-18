// Dashboard Home Page
"use client"

import { useSession } from "@/components/session-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileText, Clock, Users } from "lucide-react"

export default function DashboardPage() {
  const { user } = useSession()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">
          Welcome, {user?.name}
        </h2>
        <p className="text-gray-500 mt-1">
          Control Room Management Dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* DG Operations Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-500" />
              DG Operations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Manage DG operations data entry, view records, and update signatures.
            </p>
            <Link href="/dg-operations">
              <Button className="w-full">Access Module</Button>
            </Link>
          </CardContent>
        </Card>


        {/* Coming Soon Cards */}
        <Card className="opacity-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-gray-400" />
              G1 Mahabahu 
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Operational monitoring and management system for the G1 Mahabahu unit/station
            </p>
            <Button className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
        
        <Card className="opacity-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-gray-400" />
              G4 Pragjyotispur 
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Dedicated monitoring and data management for the G4 Pragjyotispur unit
            </p>
            <Button className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card className="opacity-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-gray-400" />
              CBS (Control & Breaker System)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Centralized management for circuit breakers and control systems across the facility. 
            </p>
            <Button className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <Link href="/dg-operations">
                <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Create New DG Operation Entry
                </Button>
            </Link>
          </div>
          <div>
            <Link href="/dg-operations/records">
                <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                View All Records
                </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
