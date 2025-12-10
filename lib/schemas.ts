// Validation Schemas using Zod
import { z } from "zod"

// Login Schema
export const loginSchema = z.object({
  phoneNumber: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[0-9]+$/, "Phone number must contain only digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export type LoginInput = z.infer<typeof loginSchema>

// DG Operation Create Schema
export const dgOperationCreateSchema = z.object({
  date: z.coerce.date(),
  shift: z.enum(["M/S", "G/S", "E/S"], {
    message: "Please select a shift",
  }),
  
  // EOD and Testing Hours
  eodInShift: z.string().optional(),
  testingHrsFrom: z.string().optional(),
  testingHrsTo: z.string().optional(),
  
  // Load and Testing Progressive Hours
  testingProgressiveHrs: z.coerce.number().optional(),
  loadHrsFrom: z.string().optional(),
  loadHrsTo: z.string().optional(),
  loadProgressiveHrs: z.coerce.number().optional(),
  hrsMeterReading: z.coerce.number().optional(),
  
  // Oil Levels and Stock
  oilLevelInDieselTank: z.coerce.number().optional(),
  lubeOilLevelInEngine: z.coerce.number().optional(),
  oilStockInStore: z.coerce.number().optional(),
  lubeOilStockInStore: z.coerce.number().optional(),
  oilFilledInLiters: z.coerce.number().optional(),
  
  // Battery and Engine Status
  batteryCondition: z.string().optional(),
  oilPressure: z.coerce.number().optional(),
  oilTemperature: z.coerce.number().optional(),
  
  // Staff Information
  onDutyStaff: z.string().optional(),
  
  // Remarks
  remarks: z.string().optional(),
})

export type DGOperationCreateInput = z.infer<typeof dgOperationCreateSchema>

// Update EOD/AE Signature Schema
export const updateSignatureSchema = z.object({
  operationId: z.string(),
})

export type UpdateSignatureInput = z.infer<typeof updateSignatureSchema>
