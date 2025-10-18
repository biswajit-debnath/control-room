// DG Operations Records Page
"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "@/components/session-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { formatDate, formatTime, formatDateTime } from "@/lib/utils"
import { CheckCircle, XCircle, FileText, PlusCircle, Filter } from "lucide-react"
import Link from "next/link"

type DGOperation = {
  id: string
  date: string
  shift: string
  onDutyStaff?: string
  digitalSignatureDutyStaff?: string
  digitalSignatureEodAe?: string
  signedAt?: string
  createdAt: string
  remarks?: string
}

export default function RecordsPage() {
  const { user, loading } = useSession()
  const router = useRouter()
  
  const [records, setRecords] = useState<DGOperation[]>([])
  const [filteredRecords, setFilteredRecords] = useState<DGOperation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterDate, setFilterDate] = useState("")
  const [filterShift, setFilterShift] = useState("")
  const [signingRecordId, setSigningRecordId] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchRecords()
    }
  }, [user])

  const applyFilters = useCallback(() => {
    let filtered = [...records]

    if (filterDate) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.date).toISOString().split('T')[0]
        return recordDate === filterDate
      })
    }

    if (filterShift) {
      filtered = filtered.filter(record => record.shift === filterShift)
    }

    setFilteredRecords(filtered)
  }, [records, filterDate, filterShift])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  const fetchRecords = async () => {
    try {
      const res = await fetch("/api/dg-operations")
      if (!res.ok) throw new Error("Failed to fetch records")
      
      const data = await res.json()
      setRecords(data.data)
    } catch (error) {
      toast.error("Failed to load records")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignature = async (recordId: string) => {
    if (!user || (user.role !== "EOD" && user.role !== "AE")) {
      toast.error("Only EOD and AE can sign entries")
      return
    }

    setSigningRecordId(recordId)

    try {
      const res = await fetch(`/api/dg-operations/${recordId}/signature`, {
        method: "PATCH",
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to sign entry")
      }

      toast.success("Entry signed successfully!")
      fetchRecords()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to sign entry")
    } finally {
      setSigningRecordId(null)
    }
  }

  const viewDateDetails = (date: string) => {
    // Navigate to the detail page for this date
    const encodedDate = encodeURIComponent(new Date(date).toISOString())
    router.push(`/dg-operations/records/${encodedDate}`)
  }

  // Group records by date
  const groupedRecords = filteredRecords.reduce((acc, record) => {
    const date = formatDate(record.date)
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(record)
    return acc
  }, {} as Record<string, DGOperation[]>)

  if (loading || isLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    router.push("/login")
    return null
  }

  const canSign = user.role === "EOD" || user.role === "AE"

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">All Records</h2>
          <p className="text-gray-500 mt-1">View and manage DG operation entries</p>
        </div>
        <Link href="/dg-operations">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Entry
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="filterDate">Filter by Date</Label>
              <Input
                id="filterDate"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="filterShift">Filter by Shift</Label>
              <Select
                id="filterShift"
                value={filterShift}
                onChange={(e) => setFilterShift(e.target.value)}
              >
                <option value="">All Shifts</option>
                <option value="M/s">M/s</option>
                <option value="G/s">G/s</option>
                <option value="E/s">E/s</option>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setFilterDate("")
                  setFilterShift("")
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Records Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{filteredRecords.length}</div>
            <p className="text-sm text-gray-500">Total Entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {filteredRecords.filter(r => r.digitalSignatureEodAe).length}
            </div>
            <p className="text-sm text-gray-500">Signed by EOD/AE</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredRecords.filter(r => !r.digitalSignatureEodAe).length}
            </div>
            <p className="text-sm text-gray-500">Pending Signature</p>
          </CardContent>
        </Card>
      </div>

      {/* Grouped Records */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800">Records by Date</h3>
          {Object.entries(groupedRecords).length > 3 && (
            <p className="text-sm text-gray-500">
              Scroll to view more dates ({Object.entries(groupedRecords).length} total)
            </p>
          )}
        </div>
        <div className="overflow-y-auto scrollbar-hover" style={{ maxHeight: '1000px' }}>
          <div className="space-y-6 pr-2">
            {Object.entries(groupedRecords).length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No records found</p>
                </CardContent>
              </Card>
            ) : (
              Object.entries(groupedRecords)
                .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                .map(([date, entries]) => (
                  <Card key={date} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          📅 {date} ({entries.length} {entries.length === 1 ? "entry" : "entries"})
                        </CardTitle>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => viewDateDetails(entries[0].date)}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <div className="max-h-[200px] overflow-y-auto scrollbar-hover">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-2 text-left">Time</th>
                            <th className="px-4 py-2 text-left">Shift</th>
                            <th className="px-4 py-2 text-left">Entry #</th>
                            <th className="px-4 py-2 text-left">On Duty Staff</th>
                            <th className="px-4 py-2 text-left">Duty Staff Signature</th>
                            <th className="px-4 py-2 text-left">EOD/AE Signature</th>
                            <th className="px-4 py-2 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                        {entries.map((record, index) => (
                          <tr key={record.id} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-3">{formatTime(record.createdAt)}</td>
                            <td className="px-4 py-3">
                              <Badge variant="outline">{record.shift}</Badge>
                            </td>
                            <td className="px-4 py-3 font-mono text-xs">#{index + 1}</td>
                            <td className="px-4 py-3">{record.onDutyStaff || "-"}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-xs">{record.digitalSignatureDutyStaff}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {record.digitalSignatureEodAe ? (
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <div className="text-xs">
                                    <div>{record.digitalSignatureEodAe}</div>
                                    <div className="text-gray-500">{formatDateTime(record.signedAt!)}</div>
                                  </div>
                                </div>
                              ) : (
                                <Badge variant="warning">Pending</Badge>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                {canSign && !record.digitalSignatureEodAe && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleSignature(record.id)}
                                    disabled={signingRecordId === record.id}
                                  >
                                    {signingRecordId === record.id ? "Signing..." : "Sign"}
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
