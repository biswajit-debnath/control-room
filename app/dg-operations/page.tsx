// DG Operations Entry Form Page
"use client"

import { useState, useEffect } from "react"
import { useSession } from "@/components/session-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { FileText, Save } from "lucide-react"
import Link from "next/link"
import testingConfig, { isTestingEnabled, testLog } from "@/testing.config"

interface EODUser {
  id: string
  name: string
  phoneNumber: string
}

export default function DGOperationsPage() {
  const { user, loading } = useSession()
  const router = useRouter()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [eodUsers, setEodUsers] = useState<EODUser[]>([])
  const [showCustomEod, setShowCustomEod] = useState(false)
  
  // Helper function to get current browser time in datetime-local format
  const getCurrentBrowserTime = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  // Helper function to convert 24-hour time to 12-hour format with AM/PM
  const formatTimeTo12Hour = (time24: string): string => {
    if (!time24) return ""
    const [hours, minutes] = time24.split(':')
    const hour = parseInt(hours, 10)
    const period = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${period}`
  }
  
  const [formData, setFormData] = useState({
    date: getCurrentBrowserTime(),
    shift: "",
    eodInShift: "",
    customEod: "",
    testingHrsFrom: "",
    testingHrsTo: "",
    testingProgressiveHrs: "",
    loadHrsFrom: "",
    loadHrsTo: "",
    loadProgressiveHrs: "",
    hrsMeterReading: "",
    oilLevelInDieselTank: "",
    lubeOilLevelInEngine: "",
    oilStockInStore: "",
    lubeOilStockInStore: "",
    oilFilledInLiters: "",
    batteryCondition: "",
    oilPressure: "",
    oilTemperature: "",
    onDutyStaff: "",
    remarks: "",
  })

  // Fetch EOD users on component mount
  useEffect(() => {
    const fetchEodUsers = async () => {
      try {
        const res = await fetch("/api/users/eod")
        if (res.ok) {
          const data = await res.json()
          setEodUsers(data)
        }
      } catch (error) {
        console.error("Error fetching EOD users:", error)
      }
    }

    fetchEodUsers()
  }, [])

  // Auto-fill form for testing (controlled by testing config)
  useEffect(() => {
    // Only run if testing is enabled and auto-fill flag is on
    if (isTestingEnabled() && testingConfig.autoFillDGForm) {
      // Set a timeout to allow the component to fully render
      const delay = testingConfig.reducedDelays ? 300 : 500
      const timer = setTimeout(() => {
        testLog('Auto-filling DG Operations form...')
        
        setFormData(prev => ({
          ...prev,
          testingHrsFrom: '08:00',
          testingHrsTo: '10:30',
          testingProgressiveHrs: '2.5',
          loadHrsFrom: '08:00',
          loadHrsTo: '10:30',
          loadProgressiveHrs: '2.5',
          hrsMeterReading: '2',
          oilLevelInDieselTank: '750',
          lubeOilLevelInEngine: '15',
          oilStockInStore: '500',
          lubeOilStockInStore: '200',
          oilFilledInLiters: '100',
          batteryCondition: 'Good',
          oilPressure: '45',
          oilTemperature: '85',
          onDutyStaff: 'Test Operator',
          remarks: 'Auto-filled test data'
        }))
        
        testLog('Form auto-filled! Remember to set Date/Time, Shift, and EOD.')
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    router.push("/login")
    return null
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    
    // Handle EOD selection
    if (name === "eodInShift") {
      if (value === "custom") {
        setShowCustomEod(true)
        setFormData({ ...formData, [name]: "", customEod: "" })
      } else {
        setShowCustomEod(false)
        setFormData({ ...formData, [name]: value, customEod: "" })
      }
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Use custom EOD if provided, otherwise use selected EOD
      const finalEodInShift = showCustomEod && formData.customEod 
        ? formData.customEod 
        : formData.eodInShift

      const res = await fetch("/api/dg-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          date: new Date(formData.date),
          eodInShift: finalEodInShift || undefined,
          testingProgressiveHrs: formData.testingProgressiveHrs ? parseFloat(formData.testingProgressiveHrs) : undefined,
          loadProgressiveHrs: formData.loadProgressiveHrs ? parseFloat(formData.loadProgressiveHrs) : undefined,
          hrsMeterReading: formData.hrsMeterReading ? parseFloat(formData.hrsMeterReading) : undefined,
          oilLevelInDieselTank: formData.oilLevelInDieselTank ? parseFloat(formData.oilLevelInDieselTank) : undefined,
          lubeOilLevelInEngine: formData.lubeOilLevelInEngine ? parseFloat(formData.lubeOilLevelInEngine) : undefined,
          oilStockInStore: formData.oilStockInStore ? parseFloat(formData.oilStockInStore) : undefined,
          lubeOilStockInStore: formData.lubeOilStockInStore ? parseFloat(formData.lubeOilStockInStore) : undefined,
          oilFilledInLiters: formData.oilFilledInLiters ? parseFloat(formData.oilFilledInLiters) : undefined,
          oilPressure: formData.oilPressure ? parseFloat(formData.oilPressure) : undefined,
          oilTemperature: formData.oilTemperature ? parseFloat(formData.oilTemperature) : undefined,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to create entry")
      }

      toast.success("Entry created successfully!")
      
      // Reset form for next entry
      setShowCustomEod(false)
      setFormData({
        date: getCurrentBrowserTime(),
        shift: "",
        eodInShift: "",
        customEod: "",
        testingHrsFrom: "",
        testingHrsTo: "",
        testingProgressiveHrs: "",
        loadHrsFrom: "",
        loadHrsTo: "",
        loadProgressiveHrs: "",
        hrsMeterReading: "",
        oilLevelInDieselTank: "",
        lubeOilLevelInEngine: "",
        oilStockInStore: "",
        lubeOilStockInStore: "",
        oilFilledInLiters: "",
        batteryCondition: "",
        oilPressure: "",
        oilTemperature: "",
        onDutyStaff: "",
        remarks: "",
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create entry")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-3xl font-bold text-gray-900">DG Operations</h2>
            <p className="text-sm md:text-base text-gray-500 mt-1">Create new operation entry</p>
          </div>
          <Link href="/dg-operations/records">
            <Button variant="outline" className="w-full md:w-auto text-xs md:text-sm">
              <FileText className="h-4 w-4 mr-2" />
              View All Records
            </Button>
          </Link>
        </div>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4 md:pt-6">
          <p className="text-xs md:text-sm text-blue-800">
            ℹ️ You can submit multiple entries for the same day and shift. 
            Each submission creates a new record. The form will reset after successful submission.
          </p>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Entry Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            {/* Row 1: Date & Shift */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="date" className="text-xs md:text-sm">Date & Time *</Label>
                <Input
                  id="date"
                  name="date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  disabled={!(isTestingEnabled() && testingConfig.enableDateTimeChange)}
                  className="text-xs md:text-sm"
                />
              </div>
              <div>
                <Label htmlFor="shift" className="text-xs md:text-sm">Shift *</Label>
                <Select
                  id="shift"
                  name="shift"
                  value={formData.shift}
                  onChange={handleChange}
                  required
                  className="text-xs md:text-sm"
                >
                  <option value="">Select Shift</option>
                  <option value="M/s">M/s</option>
                  <option value="G/s">G/s</option>
                  <option value="E/s">E/s</option>
                </Select>
              </div>
              <div className={showCustomEod ? "md:col-span-2" : ""}>
                <Label htmlFor="eodInShift" className="text-xs md:text-sm">EOD in Shift</Label>
                <div className="flex flex-col md:flex-row gap-2">
                  <Select
                    id="eodInShift"
                    name="eodInShift"
                    value={formData.eodInShift}
                    onChange={handleChange}
                    className={`text-xs md:text-sm ${showCustomEod ? "md:flex-1" : ""}`}
                  >
                    <option value="">Select EOD</option>
                    {eodUsers.map((eod) => (
                      <option key={eod.id} value={eod.name}>
                        {eod.name}
                      </option>
                    ))}
                    <option value="custom">+ Add Custom EOD</option>
                  </Select>
                  {showCustomEod && (
                    <Input
                      id="customEod"
                      name="customEod"
                      type="text"
                      placeholder="Enter EOD name"
                      value={formData.customEod}
                      onChange={handleChange}
                      className="text-xs md:text-sm md:flex-1"
                    />
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="testingHrsFrom" className="text-xs md:text-sm">Testing Hrs From</Label>
                <Input
                  id="testingHrsFrom"
                  name="testingHrsFrom"
                  type="time"
                  value={formData.testingHrsFrom}
                  onChange={handleChange}
                  className="text-xs md:text-sm"
                />
              </div>
            </div>

            {/* Row 2: Testing & Load Hours */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4">
              <div>
                <Label htmlFor="testingHrsTo" className="text-xs md:text-sm">Testing Hrs To</Label>
                <Input
                  id="testingHrsTo"
                  name="testingHrsTo"
                  type="time"
                  value={formData.testingHrsTo}
                  onChange={handleChange}
                  className="text-xs md:text-sm"
                />
              </div>
              <div>
                <Label htmlFor="testingProgressiveHrs" className="text-xs md:text-sm">Test Prog. Hrs</Label>
                <Input
                  id="testingProgressiveHrs"
                  name="testingProgressiveHrs"
                  type="number"
                  step="0.01"
                  value={formData.testingProgressiveHrs}
                  onChange={handleChange}
                  className="text-xs md:text-sm"
                />
              </div>
              <div>
                <Label htmlFor="loadHrsFrom" className="text-xs md:text-sm">Load Hrs From</Label>
                <Input
                  id="loadHrsFrom"
                  name="loadHrsFrom"
                  type="time"
                  value={formData.loadHrsFrom}
                  onChange={handleChange}
                  className="text-xs md:text-sm"
                />
              </div>
              <div>
                <Label htmlFor="loadHrsTo" className="text-xs md:text-sm">Load Hrs To</Label>
                <Input
                  id="loadHrsTo"
                  name="loadHrsTo"
                  type="time"
                  value={formData.loadHrsTo}
                  onChange={handleChange}
                  className="text-xs md:text-sm"
                />
              </div>
              <div>
                <Label htmlFor="loadProgressiveHrs" className="text-xs md:text-sm">Load Prog. Hrs</Label>
                <Input
                  id="loadProgressiveHrs"
                  name="loadProgressiveHrs"
                  type="number"
                  step="0.01"
                  value={formData.loadProgressiveHrs}
                  onChange={handleChange}
                  className="text-xs md:text-sm"
                />
              </div>
            </div>

            {/* Row 3: Meter Reading & Oil Levels */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4">
              <div>
                <Label htmlFor="hrsMeterReading" className="text-xs md:text-sm">Hrs Meter</Label>
                <Input
                  id="hrsMeterReading"
                  name="hrsMeterReading"
                  type="number"
                  step="0.01"
                  value={formData.hrsMeterReading}
                  onChange={handleChange}
                  className="text-xs md:text-sm"
                />
              </div>
              <div>
                <Label htmlFor="oilLevelInDieselTank" className="text-xs md:text-sm">Diesel Level</Label>
                <Input
                  id="oilLevelInDieselTank"
                  name="oilLevelInDieselTank"
                  type="number"
                  step="0.01"
                  value={formData.oilLevelInDieselTank}
                  onChange={handleChange}
                  className="text-xs md:text-sm"
                />
              </div>
              <div>
                <Label htmlFor="lubeOilLevelInEngine" className="text-xs md:text-sm">Lube Level</Label>
                <Input
                  id="lubeOilLevelInEngine"
                  name="lubeOilLevelInEngine"
                  type="number"
                  step="0.01"
                  value={formData.lubeOilLevelInEngine}
                  onChange={handleChange}
                  className="text-xs md:text-sm"
                />
              </div>
              <div>
                <Label htmlFor="oilStockInStore" className="text-xs md:text-sm">Oil Stock</Label>
                <Input
                  id="oilStockInStore"
                  name="oilStockInStore"
                  type="number"
                  step="0.01"
                  value={formData.oilStockInStore}
                  onChange={handleChange}
                  className="text-xs md:text-sm"
                />
              </div>
              <div>
                <Label htmlFor="lubeOilStockInStore" className="text-xs md:text-sm">Lube Stock</Label>
                <Input
                  id="lubeOilStockInStore"
                  name="lubeOilStockInStore"
                  type="number"
                  step="0.01"
                  value={formData.lubeOilStockInStore}
                  onChange={handleChange}
                  className="text-xs md:text-sm"
                />
              </div>
            </div>

            {/* Row 4: Oil Filled, Battery, Pressure & Temperature */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4">
              <div>
                <Label htmlFor="oilFilledInLiters" className="text-xs md:text-sm">Oil Filled (L)</Label>
                <Input
                  id="oilFilledInLiters"
                  name="oilFilledInLiters"
                  type="number"
                  step="0.01"
                  value={formData.oilFilledInLiters}
                  onChange={handleChange}
                  className="text-xs md:text-sm"
                />
              </div>
              <div>
                <Label htmlFor="batteryCondition" className="text-xs md:text-sm">Battery</Label>
                <Input
                  id="batteryCondition"
                  name="batteryCondition"
                  type="text"
                  value={formData.batteryCondition}
                  onChange={handleChange}
                  className="text-xs md:text-sm"
                />
              </div>
              <div>
                <Label htmlFor="oilPressure" className="text-xs md:text-sm">Pressure</Label>
                <Input
                  id="oilPressure"
                  name="oilPressure"
                  type="number"
                  step="0.01"
                  value={formData.oilPressure}
                  onChange={handleChange}
                  className="text-xs md:text-sm"
                />
              </div>
              <div>
                <Label htmlFor="oilTemperature" className="text-xs md:text-sm">Temperature</Label>
                <Input
                  id="oilTemperature"
                  name="oilTemperature"
                  type="number"
                  step="0.01"
                  value={formData.oilTemperature}
                  onChange={handleChange}
                  className="text-xs md:text-sm"
                />
              </div>
              <div>
                <Label htmlFor="onDutyStaff" className="text-xs md:text-sm">On Duty Staff</Label>
                <Input
                  id="onDutyStaff"
                  name="onDutyStaff"
                  type="text"
                  value={formData.onDutyStaff}
                  onChange={handleChange}
                  className="text-xs md:text-sm"
                />
              </div>
            </div>

            {/* Row 5: Digital Signature (Auto-filled) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <Label htmlFor="dutyStaffSignature" className="text-xs md:text-sm">Digital Signature of on Duty Staff</Label>
                <Input
                  id="dutyStaffSignature"
                  type="text"
                  value={user?.name || ""}
                  disabled
                  className="bg-gray-100 cursor-not-allowed text-xs md:text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Auto-filled with your name upon submission
                </p>
              </div>
            </div>

            {/* Remarks */}
            <div>
              <Label htmlFor="remarks" className="text-xs md:text-sm">Remarks</Label>
              <Textarea
                id="remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={3}
                placeholder="Enter any additional remarks..."
                className="text-xs md:text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-center mt-4 md:mt-6">
          <Button type="submit" size="lg" disabled={isSubmitting} className="w-full md:w-auto text-sm md:text-base">
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Submitting..." : "Submit Entry"}
          </Button>
        </div>
        
        <p className="text-center text-xs md:text-sm text-gray-500 mt-3 md:mt-4">
          Form will reset after submission for next entry
        </p>
      </form>
    </div>
  )
}
