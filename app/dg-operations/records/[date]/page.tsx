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
import { ArrowLeft, CheckCircle, Edit, FileDown } from "lucide-react"
import Link from "next/link"
import * as XLSX from "xlsx"

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
    if (dateParam) {
      // Decode the date from URL
      const decodedDate = decodeURIComponent(dateParam)
      setSelectedDate(new Date(decodedDate))
      fetchRecords(decodedDate)
    }
  }, [user, dateParam])

  const fetchRecords = async (date: string) => {
    try {
      console.log("Fetching records for date:", date)
      const res = await fetch(`/api/dg-operations?date=${encodeURIComponent(date)}`)
      if (!res.ok) throw new Error("Failed to fetch records")
      
      const data = await res.json()
      console.log("Received records:", data.data)
      setRecords(data.data)
    } catch (error) {
      console.error("Error fetching records:", error)
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

  const exportToExcel = () => {
    if (records.length === 0) {
      toast.error("No data to export")
      return
    }

    try {
      // Prepare data for export
      const exportData = records.map((record, index) => ({
        "Sr. No.": index + 1,
        "Date": formatDate(record.date),
        "Time": formatTime(record.date),
        "Shift": record.shift,
        "EOD in Shift": record.eodInShift || "-",
        "Testing Hours From": formatTimeTo12Hour(record.testingHrsFrom),
        "Testing Hours To": formatTimeTo12Hour(record.testingHrsTo),
        "Testing Progressive Hours": record.testingProgressiveHrs || "-",
        "Load Hours From": formatTimeTo12Hour(record.loadHrsFrom),
        "Load Hours To": formatTimeTo12Hour(record.loadHrsTo),
        "Load Progressive Hours": record.loadProgressiveHrs || "-",
        "Hours Meter Reading": record.hrsMeterReading || "-",
        "Oil Level in Diesel Tank": record.oilLevelInDieselTank || "-",
        "Lube Oil Level in Engine": record.lubeOilLevelInEngine || "-",
        "Lube Oil Pressure": record.oilPressure || "-",
        "Oil Stock in Store": record.oilStockInStore || "-",
        "Lube Oil Stock in Store": record.lubeOilStockInStore || "-",
        "Oil Filled (Liters)": record.oilFilledInLiters || "-",
        "Battery Condition": record.batteryCondition || "-",
        "Oil Temperature": record.oilTemperature || "-",
        "On Duty Staff": record.onDutyStaff || "-",
        "Staff Signature": record.digitalSignatureDutyStaff || "-",
        "EOD/AE Signature": record.digitalSignatureEodAe || "Pending",
        "Signed At": record.signedAt ? new Date(record.signedAt).toLocaleString() : "-",
        "Remarks": record.remarks || "-",
      }))

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "DG Operations")

      // Auto-size columns
      const max_width = exportData.reduce((w: any, r: any) => {
        return Object.keys(r).map(key => {
          const cellValue = r[key]?.toString() || ""
          return Math.max(w[key] || 10, cellValue.length)
        })
      }, {})

      ws['!cols'] = Object.keys(exportData[0] || {}).map((key, i) => ({
        wch: Math.min(max_width[key] || 10, 50)
      }))

      // Generate file name with date
      const fileName = `DG_Operations_${selectedDate ? formatDate(selectedDate).replace(/\//g, "-") : "Export"}.xlsx`

      // Export file
      XLSX.writeFile(wb, fileName)
      toast.success("Excel file exported successfully!")
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Failed to export data")
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

  const canSign = user && (user.role === "EOD" || user.role === "AE")

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
    "M/S": records.filter(r => r.shift === "M/S"),
    "G/S": records.filter(r => r.shift === "G/S"),
    "E/S": records.filter(r => r.shift === "E/S"),
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
                  <th className="px-2 md:px-4 py-3 text-left font-semibold text-xs whitespace-nowrap sticky left-0 bg-gradient-to-r from-gray-50 to-gray-100 z-10 shadow-sm">Shift</th>
                  <th className="px-2 md:px-4 py-3 text-left font-semibold text-xs whitespace-nowrap">Time</th>
                  <th className="px-2 md:px-4 py-3 text-left font-semibold text-xs whitespace-nowrap">EOD</th>
                  <th className="px-2 md:px-4 py-3 text-left font-semibold text-xs whitespace-nowrap">Test From</th>
                  <th className="px-2 md:px-4 py-3 text-left font-semibold text-xs whitespace-nowrap">Test To</th>
                  <th className="px-2 md:px-4 py-3 text-left font-semibold text-xs whitespace-nowrap">Test Prog.</th>
                  <th className="px-2 md:px-4 py-3 text-left font-semibold text-xs whitespace-nowrap">Load From</th>
                  <th className="px-2 md:px-4 py-3 text-left font-semibold text-xs whitespace-nowrap">Load To</th>
                  <th className="px-2 md:px-4 py-3 text-left font-semibold text-xs whitespace-nowrap">Load Prog.</th>
                  <th className="px-2 md:px-4 py-3 text-left font-semibold text-xs whitespace-nowrap">Hours Meter</th>
                  <th className="px-2 md:px-4 py-3 text-left font-semibold text-xs whitespace-nowrap">Diesel Level</th>
                  <th className="px-2 md:px-4 py-3 text-left font-semibold text-xs whitespace-nowrap">Lube Level</th>
                  <th className="px-2 md:px-4 py-3 text-left font-semibold text-xs whitespace-nowrap">Lube Pressure</th>
                  <th className="px-2 md:px-4 py-3 text-left font-semibold text-xs whitespace-nowrap">Oil Stock</th>
                  <th className="px-2 md:px-4 py-3 text-left font-semibold text-xs whitespace-nowrap">Lube Stock</th>
                  <th className="px-2 md:px-4 py-3 text-left font-semibold text-xs whitespace-nowrap">Oil Filled</th>
                  <th className="px-2 md:px-4 py-3 text-left font-semibold text-xs whitespace-nowrap">Battery</th>
                  <th className="px-2 md:px-4 py-3 text-left font-semibold text-xs whitespace-nowrap">Temp.</th>
                  <th className="px-2 md:px-4 py-3 text-left font-semibold text-xs whitespace-nowrap">Staff</th>
                  <th className="px-2 md:px-4 py-3 text-left font-semibold text-xs whitespace-nowrap">Staff Sign</th>
                  <th className="px-2 md:px-4 py-3 text-left font-semibold text-xs whitespace-nowrap">Remarks</th>
                  <th className="px-2 md:px-4 py-3 text-left font-semibold text-xs whitespace-nowrap sticky right-0 bg-gradient-to-r from-gray-50 to-gray-100 z-10 shadow-sm">EOD/AE Sign</th>
                </tr>
              </thead>
              <tbody>
                {shiftRecords.map((record, index) => (
                  <tr key={record.id} className={index % 2 === 0 ? "bg-white hover:bg-blue-50" : "bg-gray-50 hover:bg-blue-100"}>
                    <td className="px-2 md:px-4 py-2 md:py-3 border-b text-xs font-medium sticky left-0 bg-inherit z-10 shadow-sm">{shift}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3 border-b text-xs whitespace-nowrap">{formatTime(record.date)}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3 border-b text-xs whitespace-nowrap">{record.eodInShift || "-"}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3 border-b text-xs whitespace-nowrap">{formatTimeTo12Hour(record.testingHrsFrom)}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3 border-b text-xs whitespace-nowrap">{formatTimeTo12Hour(record.testingHrsTo)}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3 border-b text-xs whitespace-nowrap">{record.testingProgressiveHrs || "-"}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3 border-b text-xs whitespace-nowrap">{formatTimeTo12Hour(record.loadHrsFrom)}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3 border-b text-xs whitespace-nowrap">{formatTimeTo12Hour(record.loadHrsTo)}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3 border-b text-xs whitespace-nowrap">{record.loadProgressiveHrs || "-"}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3 border-b text-xs whitespace-nowrap">{record.hrsMeterReading || "-"}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3 border-b text-xs whitespace-nowrap">{record.oilLevelInDieselTank || "-"}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3 border-b text-xs whitespace-nowrap">{record.lubeOilLevelInEngine || "-"}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3 border-b text-xs whitespace-nowrap">{record.oilPressure || "-"}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3 border-b text-xs whitespace-nowrap">{record.oilStockInStore || "-"}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3 border-b text-xs whitespace-nowrap">{record.lubeOilStockInStore || "-"}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3 border-b text-xs whitespace-nowrap">{record.oilFilledInLiters || "-"}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3 border-b text-xs whitespace-nowrap">{record.batteryCondition || "-"}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3 border-b text-xs whitespace-nowrap">{record.oilTemperature || "-"}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3 border-b text-xs whitespace-nowrap">{record.onDutyStaff || "-"}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3 border-b">
                      <div className="flex items-center gap-1 md:gap-2">
                        <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-500 flex-shrink-0" />
                        <span className="text-xs truncate max-w-[80px] md:max-w-none">{record.digitalSignatureDutyStaff}</span>
                      </div>
                    </td>
                    <td className="px-2 md:px-4 py-2 md:py-3 border-b text-xs max-w-[100px] md:max-w-xs truncate" title={record.remarks || "-"}>
                      {record.remarks || "-"}
                    </td>
                    <td className="px-2 md:px-4 py-2 md:py-3 border-b sticky right-0 bg-inherit z-10 shadow-sm">
                      {record.digitalSignatureEodAe ? (
                        // Signed - Show signature with checkmark
                        <div className="flex items-center gap-1 md:gap-2">
                          <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-500 flex-shrink-0" />
                          <span className="text-xs truncate max-w-[80px] md:max-w-none">{record.digitalSignatureEodAe}</span>
                        </div>
                      ) : canSign ? (
                        // Not signed but user has permission - Show sign button
                        <Button
                          size="sm"
                          onClick={() => handleSignature(record.id)}
                          disabled={signingRecordId === record.id}
                          className="text-xs px-2 py-1 h-auto"
                        >
                          {signingRecordId === record.id ? "..." : "Sign"}
                        </Button>
                      ) : (
                        // Not signed and user has no permission - Show pending badge
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 text-xs px-2 py-0.5">
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
      <div className="space-y-4">
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Link href="/dg-operations/records">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Records
            </Button>
          </Link>
          
          {records.length > 0 && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={exportToExcel}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
          )}
        </div>
        
        {/* Title and Description */}
        <div className="mt-2">
          <h2 className="text-xl md:text-3xl font-bold text-gray-900">
            DG Operations - {selectedDate && formatDate(selectedDate)}
          </h2>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Detailed view of all entries for this date
          </p>
        </div>
      </div>

      {/* Public View Notice for unauthenticated users */}
      {!user && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <p className="text-sm text-blue-700 flex items-center gap-2">
              👁️ <span>
                <strong>Public View:</strong> You are viewing records in read-only mode. 
                Login to create new entries or sign records.
              </span>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-800">
            ℹ️ For the date {selectedDate && formatDate(selectedDate)}, there {records.length === 1 ? 'is' : 'are'} <strong>{records.length}</strong> {records.length === 1 ? 'entry' : 'entries'} recorded.
          </p>
        </CardContent>
      </Card>

      {/* Shift Tables */}
      <div className="space-y-6">
        {renderShiftTable("M/S", shiftGroups["M/S"])}
        {renderShiftTable("G/S", shiftGroups["G/S"])}
        {renderShiftTable("E/S", shiftGroups["E/S"])}
      </div>
    </div>
  )
}
