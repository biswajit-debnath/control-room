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
    fetchRecords()
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
    if (!user || (user.role !== "EOD" && user.role !== "AE" && user.role !== "SEA" && user.role !== "EA")) {
      toast.error("Only EOD, AE, SEA, and EA can sign entries")
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

  const canSign = user && (user.role === "EOD" || user.role === "AE")

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-3xl font-bold text-gray-900">All Records</h2>
            <p className="text-sm md:text-base text-gray-500 mt-1">
              {user ? "View and manage DG operation entries" : "Viewing DG operation entries (read-only)"}
            </p>
          </div>
          {user ? (
            <Link href="/dg-operations">
              <Button className="w-full md:w-auto">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Entry
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button className="w-full md:w-auto">
                <PlusCircle className="h-4 w-4 mr-2" />
                Login to Create Entry
              </Button>
            </Link>
          )}
        </div>

        {/* Public View Notice for unauthenticated users */}
        {!user && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <p className="text-sm text-blue-700">
                👁️ <strong>Public View:</strong> You are viewing records in read-only mode. 
                Login to create new entries or sign records.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base md:text-lg">
            <Filter className="h-4 w-4 md:h-5 md:w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="filterDate" className="text-xs md:text-sm">Filter by Date</Label>
              <Input
                id="filterDate"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="text-xs md:text-sm"
              />
            </div>
            <div>
              <Label htmlFor="filterShift" className="text-xs md:text-sm">Filter by Shift</Label>
              <Select
                id="filterShift"
                value={filterShift}
                onChange={(e) => setFilterShift(e.target.value)}
                className="text-xs md:text-sm"
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
                className="w-full text-xs md:text-sm"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Records Summary */}
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <Card>
          <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
            <div className="text-lg md:text-2xl font-bold text-gray-900">{filteredRecords.length}</div>
            <p className="text-xs md:text-sm text-gray-500">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
            <div className="text-lg md:text-2xl font-bold text-green-600">
              {filteredRecords.filter(r => r.digitalSignatureEodAe).length}
            </div>
            <p className="text-xs md:text-sm text-gray-500">Signed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
            <div className="text-lg md:text-2xl font-bold text-yellow-600">
              {filteredRecords.filter(r => !r.digitalSignatureEodAe).length}
            </div>
            <p className="text-xs md:text-sm text-gray-500">Pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Grouped Records */}
      <div>
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <h3 className="text-lg md:text-xl font-semibold text-gray-800">Records by Date</h3>
          {Object.entries(groupedRecords).length > 3 && (
            <p className="text-xs md:text-sm text-gray-500">
              Scroll to view more ({Object.entries(groupedRecords).length} dates)
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
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <CardTitle className="text-sm md:text-lg">
                          📅 {date} ({entries.length} {entries.length === 1 ? "entry" : "entries"})
                        </CardTitle>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => viewDateDetails(entries[0].date)}
                          className="text-xs md:text-sm w-full md:w-auto"
                        >
                          View Details
                        </Button>
                      </div>
                    </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <div className="max-h-[200px] overflow-y-auto scrollbar-hover">
                      <table className="w-full text-xs md:text-sm min-w-max">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th className="px-2 md:px-4 py-2 text-left font-semibold">Time</th>
                            <th className="px-2 md:px-4 py-2 text-left font-semibold">Shift</th>
                            <th className="px-2 md:px-4 py-2 text-left font-semibold">Entry #</th>
                            <th className="px-2 md:px-4 py-2 text-left font-semibold">Staff</th>
                            <th className="px-2 md:px-4 py-2 text-left font-semibold">Staff Sign</th>
                            <th className="px-2 md:px-4 py-2 text-left font-semibold">EOD/AE Sign</th>
                            <th className="px-2 md:px-4 py-2 text-left font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                        {entries.map((record, index) => (
                          <tr key={record.id} className="border-t hover:bg-gray-50">
                            <td className="px-2 md:px-4 py-2 md:py-3 whitespace-nowrap">{formatTime(record.createdAt)}</td>
                            <td className="px-2 md:px-4 py-2 md:py-3">
                              <Badge variant="outline" className="text-xs">{record.shift}</Badge>
                            </td>
                            <td className="px-2 md:px-4 py-2 md:py-3 font-mono">#{index + 1}</td>
                            <td className="px-2 md:px-4 py-2 md:py-3 max-w-[80px] md:max-w-none truncate" title={record.onDutyStaff || "-"}>{record.onDutyStaff || "-"}</td>
                            <td className="px-2 md:px-4 py-2 md:py-3">
                              <div className="flex items-center gap-1 md:gap-2">
                                <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-500 flex-shrink-0" />
                                <span className="truncate max-w-[80px] md:max-w-none" title={record.digitalSignatureDutyStaff}>{record.digitalSignatureDutyStaff}</span>
                              </div>
                            </td>
                            <td className="px-2 md:px-4 py-2 md:py-3">
                              {record.digitalSignatureEodAe ? (
                                <div className="flex items-center gap-1 md:gap-2">
                                  <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-500 flex-shrink-0" />
                                  <div>
                                    <div className="truncate max-w-[80px] md:max-w-none" title={record.digitalSignatureEodAe}>{record.digitalSignatureEodAe}</div>
                                    <div className="text-gray-500 hidden md:block">{formatDateTime(record.signedAt!)}</div>
                                  </div>
                                </div>
                              ) : (
                                <Badge variant="warning" className="text-xs px-2 py-0.5">Pending</Badge>
                              )}
                            </td>
                            <td className="px-2 md:px-4 py-2 md:py-3">
                              <div className="flex gap-2">
                                {canSign && !record.digitalSignatureEodAe && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleSignature(record.id)}
                                    disabled={signingRecordId === record.id}
                                    className="text-xs px-2 py-1 h-auto"
                                  >
                                    {signingRecordId === record.id ? "..." : "Sign"}
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
