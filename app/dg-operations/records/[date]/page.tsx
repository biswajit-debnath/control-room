// DG Operations Detail Page - Shows all entries for a specific date
"use client"

import { useState, useEffect } from "react"
import { useSession } from "@/components/session-provider"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { formatDate, formatTime } from "@/lib/utils"
import { ArrowLeft, CheckCircle, Edit } from "lucide-react"
import Link from "next/link"

type DGOperation = {
  id: string
  date: string
  shift: string
  eodInShift?: number
  testingHrsFrom?: string
  testingHrsTo?: string
  testingProgressiveHrs?: number
  loadHrsFrom?: string
  loadHrsTo?: string
  loadProgressiveHrs?: number
  hrsMeterReading?: number
  oilLevelInDieselTank?: number
  lubeOilLevelInEngine?: number
  oilStockInStore?: number
  lubeOilStockInStore?: number
  oilFilledInLiters?: number
  batteryCondition?: string
  oilPressure?: number
  oilTemperature?: number
  onDutyStaff?: string
  digitalSignatureDutyStaff?: string
  digitalSignatureEodAe?: string
  signedAt?: string
  remarks?: string
  createdAt: string
}

export default function DGOperationsDetailPage() {
  const { user, loading } = useSession()
  const router = useRouter()
  const params = useParams()
  const dateParam = params.date as string
  
  const [records, setRecords] = useState<DGOperation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [signingRecordId, setSigningRecordId] = useState<string | null>(null)

  useEffect(() => {
    if (user && dateParam) {
      // Decode the date from URL
      const decodedDate = decodeURIComponent(dateParam)
      setSelectedDate(new Date(decodedDate))
      fetchRecords(decodedDate)
    }
  }, [user, dateParam])

  const fetchRecords = async (date: string) => {
    try {
      const res = await fetch(`/api/dg-operations?date=${date}`)
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
      if (selectedDate) {
        fetchRecords(selectedDate.toISOString())
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to sign entry")
    } finally {
      setSigningRecordId(null)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push("/login")
    return null
  }

  const canSign = user.role === "EOD" || user.role === "AE"

  // Helper function to convert 24-hour time to 12-hour format with AM/PM
  const formatTimeTo12Hour = (time24: string | null | undefined): string => {
    if (!time24) return "-"
    const [hours, minutes] = time24.split(':')
    const hour = parseInt(hours, 10)
    const period = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${period}`
  }

  // Group records by shift
  const shiftGroups = {
    "M/s": records.filter(r => r.shift === "M/s"),
    "G/s": records.filter(r => r.shift === "G/s"),
    "E/s": records.filter(r => r.shift === "E/s"),
  }

  const renderShiftTable = (shift: string, shiftRecords: DGOperation[]) => {
    if (shiftRecords.length === 0) {
      return (
        <Card key={shift} className="border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-600">{shift}</span>
                </div>
                <span className="text-lg">Shift: {shift}</span>
              </div>
              <Badge variant="outline" className="bg-gray-100">No entries</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="py-12">
            <p className="text-center text-gray-500">No entries recorded for this shift</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card key={shift} className="border-2 border-blue-200 shadow-md hover:shadow-xl transition-shadow">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-300">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
                <span className="text-lg font-bold text-white">{shift}</span>
              </div>
              <div>
                <span className="text-xl font-bold text-gray-800">Shift: {shift}</span>
                <p className="text-xs text-gray-500 mt-0.5">
                  {shiftRecords.length} {shiftRecords.length === 1 ? 'entry' : 'entries'} recorded
                </p>
              </div>
            </div>
            <Badge className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 text-sm">
              {shiftRecords.length} {shiftRecords.length === 1 ? 'Entry' : 'Entries'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto scrollbar-hover">
            <table className="w-full text-sm min-w-max">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap sticky left-0 bg-gradient-to-r from-gray-50 to-gray-100 z-10 shadow-sm">Shift</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Time</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">EOD in Shift</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Testing Hr From</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Testing Hr To</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Testing Progressive Hrs</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Load Hr From</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Load Hr To</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Load Progressive Hrs</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Hrs Meter Reading</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Oil Level (Diesel Tank)</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Lube Oil Level</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Oil Stock in Store</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Lube Oil Stock</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Oil Filled (L)</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Battery Condition</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Oil Pressure</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Oil Temperature</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">On Duty Staff</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Digital Signature of on duty staff</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Remarks</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap sticky right-0 bg-gradient-to-r from-gray-50 to-gray-100 z-10 shadow-sm">Digital Signature of EOD/AE</th>
                </tr>
              </thead>
              <tbody>
                {shiftRecords.map((record, index) => (
                  <tr key={record.id} className={index % 2 === 0 ? "bg-white hover:bg-blue-50" : "bg-gray-50 hover:bg-blue-100"}>
                    <td className="px-4 py-3 border-b font-medium sticky left-0 bg-inherit z-10 shadow-sm">{shift}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap">{formatTime(record.date)}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap">{record.eodInShift || "-"}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap">{formatTimeTo12Hour(record.testingHrsFrom)}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap">{formatTimeTo12Hour(record.testingHrsTo)}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap">{record.testingProgressiveHrs || "-"}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap">{formatTimeTo12Hour(record.loadHrsFrom)}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap">{formatTimeTo12Hour(record.loadHrsTo)}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap">{record.loadProgressiveHrs || "-"}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap">{record.hrsMeterReading || "-"}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap">{record.oilLevelInDieselTank || "-"}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap">{record.lubeOilLevelInEngine || "-"}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap">{record.oilStockInStore || "-"}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap">{record.lubeOilStockInStore || "-"}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap">{record.oilFilledInLiters || "-"}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap">{record.batteryCondition || "-"}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap">{record.oilPressure || "-"}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap">{record.oilTemperature || "-"}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap">{record.onDutyStaff || "-"}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-xs">{record.digitalSignatureDutyStaff}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-b max-w-xs truncate" title={record.remarks || "-"}>
                      {record.remarks || "-"}
                    </td>
                    <td className="px-4 py-3 border-b whitespace-nowrap sticky right-0 bg-inherit z-10 shadow-sm">
                      {record.digitalSignatureEodAe ? (
                        // Signed - Show signature with checkmark
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-xs">{record.digitalSignatureEodAe}</span>
                        </div>
                      ) : canSign ? (
                        // Not signed but user has permission - Show sign button
                        <Button
                          size="sm"
                          onClick={() => handleSignature(record.id)}
                          disabled={signingRecordId === record.id}
                        >
                          {signingRecordId === record.id ? "Signing..." : "Sign"}
                        </Button>
                      ) : (
                        // Not signed and user has no permission - Show pending badge
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                          Pending
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dg-operations/records">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Records
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              DG Operations - {selectedDate && formatDate(selectedDate)}
            </h2>
            <p className="text-gray-500 mt-1">
              Detailed view of all entries for this date
            </p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-800">
            ℹ️ For the date {selectedDate && formatDate(selectedDate)}, there {records.length === 1 ? 'is' : 'are'} <strong>{records.length}</strong> {records.length === 1 ? 'entry' : 'entries'} recorded. If no reading is taken for a particular shift, it will show "No entries for this shift" in the respective shift table.
          </p>
        </CardContent>
      </Card>

      {/* Shift Tables */}
      <div className="space-y-6">
        {renderShiftTable("M/s", shiftGroups["M/s"])}
        {renderShiftTable("G/s", shiftGroups["G/s"])}
        {renderShiftTable("E/s", shiftGroups["E/s"])}
      </div>
    </div>
  )
}
