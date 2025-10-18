<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# On a single multiple entry can be submitted.

Perfect! This is an important clarification. Here's the updated specification with support for **multiple entries on a single day**:

***

# CONTROLROOM APPLICATION - PROJECT SPECIFICATION (MVP)

## Project Overview

A full-stack administrative dashboard application for managing DG Operations data with simplified role-based access control. Built with Next.js 15 App Router, Better Auth, Prisma, and MongoDB.

**Purpose:** Centralized control room system for managing DG Operations with three user roles: TA, EOD, and AE.

**Key Features:**

- Phone number + password authentication (no public signup)
- Three user roles: TA, EOD, AE
- **Multiple entries can be submitted on a single day** (different shifts or multiple entries per shift)
- DG Operations module with comprehensive data entry form
- TWO signature fields:

1. **Digital Signature of Duty Staff** - Auto-filled when form is submitted
2. **Digital Signature of EOD/AE** - Can be updated later by EOD or AE only
- Limited editing: Only Digital Signature of EOD/AE field can be updated
- Other modules displayed with "Coming Soon" tag


## Database Schema (Prisma)

```prisma
// Simplified user roles - Only 3 types
model User {
  id            String     @id @default(auto()) @map("_id") @db.ObjectId
  phoneNumber   String     @unique
  password      String
  phoneVerified Boolean    @default(true)
  role          Role       // TA, EOD, or AE
  name          String     // User's name for display
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  activities    Activity[]
  sessions      Session[]
  
  @@map("users")
}

enum Role {
  TA          // Can create form and view records
  EOD         // Can create form, view records, and update digital signature
  AE          // Can create form, view records, and update digital signature
}

// Activity tracking
model Activity {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId
  action    String   // "CREATE", "UPDATE_SIGNATURE", "VIEW"
  module    String   // "DG_OPERATIONS"
  details   String?
  timestamp DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("activities")
}

// DG Operations data - Complete form fields
// IMPORTANT: Multiple entries can exist for the same date
model DGOperation {
  id                      String   @id @default(auto()) @map("_id") @db.ObjectId
  date                    DateTime // Multiple entries can have same date
  shift                   String   // "M/s", "G/s", "E/s"
  
  // EOD and Testing Hours
  eodInShift              Float?
  testingHrsFrom          String?
  testingHrsTo            String?
  
  // Load and Testing Progressive Hours
  testingProgressiveHrs   Float?
  loadHrsFrom             String?
  testingHrsToSecond      Float?
  loadProgressiveHrs      Float?
  hrsMeterReading         Float?
  
  // Oil Levels and Stock
  oilLevelInDieselTank    Float?
  lubeOilLevelInEngine    Float?
  oilStockInStore         Float?
  lubeOilStockInStore     Float?
  oilFilledInLiters       Float?
  
  // Battery and Engine Status
  batteryCondition        String?
  oilPressure             Float?
  oilTemperature          Float?
  
  // Staff Information
  onDutyStaff             String?
  
  // SIGNATURE 1: Digital Signature of Duty Staff
  digitalSignatureDutyStaff String?
  dutyStaffId                String  @db.ObjectId
  dutyStaffSignedAt          DateTime @default(now())
  
  // SIGNATURE 2: Digital Signature of EOD/AE
  digitalSignatureEodAe   String?
  signedBy                String?  @db.ObjectId
  signedAt                DateTime?
  
  // Remarks
  remarks                 String?
  
  // Metadata
  createdBy               String   @db.ObjectId
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
  
  @@map("dg_operations")
  // Note: NO unique constraint on date - allows multiple entries per day
  @@index([date, shift])
  @@index([createdAt])
}

// Session management
model Session {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId
  token     String   @unique
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("sessions")
}
```


## User Flow

### 3. DG Operations Entry Page Flow (Multiple Entries Supported)

```
/dg-operations
  ↓
Display:
- Page header: "DG Operations" with username and role
- Form for data entry
- Date field (defaults to today, but can be changed)
- All fields editable EXCEPT:
  * Digital Signature of on Duty Staff (auto-filled, disabled)
- Submit button
- "View All Records" button at bottom
  ↓
User fills form for a shift
  ↓
User clicks Submit
  ↓
Form creates NEW entry in database
  ↓
Form resets to blank
  ↓
User can immediately submit another entry for:
├─ Same date, different shift
├─ Same date, same shift (multiple entries allowed)
└─ Different date
  ↓
Each submission creates a separate record
  ↓
No checking for duplicate date/shift combinations
```


### 4. View All Records Page Flow

```
/dg-operations/records
  ↓
Display:
- Filter options (date range, shift)
- Search functionality
- Records table showing ALL entries (multiple per day allowed)
  ↓
Records table columns:
  * Entry # (auto-increment or timestamp)
  * Date
  * Shift
  * Created At (timestamp to distinguish multiple entries)
  * On Duty Staff
  * Duty Staff Signature
  * EOD/AE Signature Status
  * Actions
  ↓
Example view for same day:
  2025-10-18 | M/s | 08:00 AM | Staff A | [Signed] | [Pending] | [Actions]
  2025-10-18 | M/s | 10:30 AM | Staff B | [Signed] | [Signed]  | [Actions]
  2025-10-18 | G/s | 02:00 PM | Staff A | [Signed] | [Pending] | [Actions]
  2025-10-18 | G/s | 04:15 PM | Staff C | [Signed] | [Signed]  | [Actions]
  ↓
Each row is a separate, independent entry
  ↓
User can:
├─ View details of any entry
├─ Update EOD/AE signature for any entry (if EOD/AE)
└─ Filter/search through all entries
```


## Component Examples

### Entry Form Component (Reset After Submit)

```typescript
// components/dg-operations/entry-form.tsx
"use client"

import { useSession } from "@/lib/hooks/use-session"

export function DGOperationEntryForm() {
  const { user } = useSession()
  
  const form = useForm({
    resolver: zodResolver(DGOperationCreateSchema),
    defaultValues: {
      date: new Date(),
      shift: undefined,
      // ... other fields
    }
  })

  const onSubmit = async (data) => {
    try {
      const res = await fetch('/api/dg-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (res.ok) {
        toast.success('Entry created successfully')
        
        // RESET FORM for next entry
        form.reset({
          date: new Date(), // Keep today's date
          shift: undefined,
          // All other fields reset to empty
        })
        
        // Optionally refresh records list if visible
      }
    } catch (error) {
      toast.error('Failed to create entry')
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          ℹ️ You can submit multiple entries for the same day and shift. 
          Each submission creates a new record.
        </p>
      </div>
      
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-5 gap-4">
          {/* Row 1 */}
          <div>
            <label>Date & Time</label>
            <Input
              type="datetime-local"
              {...form.register('date')}
            />
          </div>
          
          <Select 
            label="Shift" 
            options={['M/s', 'G/s', 'E/s']} 
            {...form.register('shift')}
          />
          
          {/* ... other fields ... */}
          
          {/* Row 4 - Duty Staff Signature (Auto-filled) */}
          <div>
            <label>Digital Signature of on Duty Staff</label>
            <Input
              value={user?.name || ''}
              disabled
              className="bg-gray-100 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Auto-filled with your name
            </p>
          </div>
        </div>
        
        {/* Remarks */}
        <Textarea 
          label="Remarks" 
          {...form.register('remarks')} 
          className="mt-4" 
        />
        
        {/* Submit Button */}
        <div className="flex justify-center mt-6">
          <Button type="submit">Submit Entry</Button>
        </div>
        
        <p className="text-center text-sm text-gray-500 mt-2">
          Form will reset after submission for next entry
        </p>
      </form>
      
      <div className="border-t pt-4">
        <Button 
          onClick={() => router.push('/dg-operations/records')}
          variant="outline"
          className="w-full"
        >
          View All Records
        </Button>
      </div>
    </div>
  )
}
```


### Records Table (Multiple Entries Per Day)

```typescript
// components/dg-operations/records-table.tsx
"use client"

export function RecordsTable({ records, currentUser }) {
  const canUpdateSignature = ['EOD', 'AE'].includes(currentUser.role)
  
  // Group by date for better visualization (optional)
  const groupedRecords = groupBy(records, r => formatDate(r.date))
  
  return (
    <div className="space-y-6">
      {Object.entries(groupedRecords).map(([date, entries]) => (
        <div key={date} className="border rounded-lg p-4">
          <h3 className="font-bold text-lg mb-4">
            {date} ({entries.length} {entries.length === 1 ? 'entry' : 'entries'})
          </h3>
          
          <table className="w-full">
            <thead>
              <tr>
                <th>Time</th>
                <th>Shift</th>
                <th>Entry #</th>
                <th>On Duty Staff</th>
                <th>Duty Staff Signature</th>
                <th>EOD/AE Signature</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((record, index) => (
                <tr key={record.id} className="border-t">
                  <td>{formatTime(record.createdAt)}</td>
                  <td>
                    <Badge variant="outline">{record.shift}</Badge>
                  </td>
                  <td>#{index + 1}</td>
                  <td>{record.onDutyStaff}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <CheckIcon className="text-green-500" />
                      <span>{record.digitalSignatureDutyStaff}</span>
                    </div>
                  </td>
                  <td>
                    {record.digitalSignatureEodAe ? (
                      <div className="flex items-center gap-2">
                        <CheckIcon className="text-green-500" />
                        <span>{record.digitalSignatureEodAe}</span>
                      </div>
                    ) : (
                      <Badge variant="warning">Pending</Badge>
                    )}
                  </td>
                  <td className="space-x-2">
                    <Button 
                      size="sm"
                      onClick={() => viewDetails(record)}
                    >
                      View
                    </Button>
                    {canUpdateSignature && (
                      <Button 
                        size="sm"
                        variant="secondary"
                        onClick={() => openSignatureModal(record)}
                      >
                        Sign
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}
```


### API Implementation (No Duplicate Checking)

```typescript
// app/api/dg-operations/route.ts
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const data = await req.json()
    
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })
    
    // NO checking for existing entries with same date/shift
    // Multiple entries are allowed
    const operation = await prisma.dGOperation.create({
      data: {
        ...data,
        createdBy: session.user.id,
        digitalSignatureDutyStaff: user.name,
        dutyStaffId: session.user.id,
        dutyStaffSignedAt: new Date(),
        digitalSignatureEodAe: null,
        signedBy: null,
        signedAt: null
      }
    })
    
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        module: "DG_OPERATIONS",
        details: `Created entry #${operation.id} for ${data.date} - ${data.shift}`
      }
    })
    
    return NextResponse.json({ success: true, data: operation })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to create" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date')
    const shift = searchParams.get('shift')
    
    const where: any = {}
    
    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      
      where.date = {
        gte: startOfDay,
        lte: endOfDay
      }
    }
    
    if (shift) {
      where.shift = shift
    }
    
    // Get ALL operations - no limit on duplicates
    const operations = await prisma.dGOperation.findMany({
      where,
      orderBy: [
        { date: 'desc' },
        { createdAt: 'desc' } // Show newest first within same day
      ],
      include: {
        user: {
          select: {
            name: true,
            role: true
          }
        }
      }
    })
    
    return NextResponse.json({ data: operations })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}
```


## Statistics and Summary Views (Optional Feature)

```typescript
// Show summary for a specific date
async function getDailySummary(date: Date) {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)
  
  const entries = await prisma.dGOperation.findMany({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  })
  
  return {
    totalEntries: entries.length,
    byShift: {
      'M/s': entries.filter(e => e.shift === 'M/s').length,
      'G/s': entries.filter(e => e.shift === 'G/s').length,
      'E/s': entries.filter(e => e.shift === 'E/s').length,
    },
    signedCount: entries.filter(e => e.digitalSignatureEodAe).length,
    pendingSignatures: entries.filter(e => !e.digitalSignatureEodAe).length
  }
}
```


## Testing Checklist

### Multiple Entries Support

- [ ] User can submit multiple entries on the same day
- [ ] User can submit multiple entries for the same shift on the same day
- [ ] Each submission creates a new, independent record
- [ ] No error for duplicate date/shift combinations
- [ ] Form resets after successful submission
- [ ] User can immediately submit another entry
- [ ] All entries display correctly in records table


### DG Operations - Form Creation

- [ ] Date field can be changed (not locked to today)
- [ ] Form submits successfully multiple times
- [ ] Each submission gets unique ID
- [ ] Duty Staff signature auto-fills each time
- [ ] createdAt timestamp is unique for each entry


### DG Operations - View Records

- [ ] All entries display (including multiple per day)
- [ ] Entries are distinguishable by timestamp
- [ ] Each entry has its own signature status
- [ ] Filters work with multiple entries per day
- [ ] Grouping by date shows all entries for that date


### Digital Signature Update

- [ ] Each entry's EOD/AE signature can be updated independently
- [ ] Updating one entry's signature doesn't affect others
- [ ] Each entry tracks its own signedBy and signedAt


## UI Enhancements for Multiple Entries

### Entry Form Page

```
┌────────────────────────────────────────────────┐
│ DG Operations                    [User Name]   │
├────────────────────────────────────────────────┤
│                                                 │
│ ℹ️ You can submit multiple entries for the     │
│    same day and shift. Each submission creates │
│    a new record.                               │
│                                                 │
│ [Form Fields...]                               │
│                                                 │
│         [Submit Entry]                         │
│                                                 │
│ Form will reset after submission               │
│                                                 │
├────────────────────────────────────────────────┤
│         [View All Records]                     │
└────────────────────────────────────────────────┘
```


### Records Page (Grouped by Date)

```
┌────────────────────────────────────────────────┐
│ All DG Operations Records                      │
├────────────────────────────────────────────────┤
│                                                 │
│ 📅 October 18, 2025 (4 entries)               │
│ ┌──────────────────────────────────────────┐  │
│ │ 08:00 AM | M/s | Entry #1 | [View][Sign] │  │
│ │ 10:30 AM | M/s | Entry #2 | [View][Sign] │  │
│ │ 02:00 PM | G/s | Entry #3 | [View][Sign] │  │
│ │ 04:15 PM | G/s | Entry #4 | [View][Sign] │  │
│ └──────────────────────────────────────────┘  │
│                                                 │
│ 📅 October 17, 2025 (3 entries)               │
│ ┌──────────────────────────────────────────┐  │
│ │ 09:15 AM | M/s | Entry #1 | [View][Sign] │  │
│ │ 03:00 PM | G/s | Entry #2 | [View][Sign] │  │
│ │ 05:45 PM | E/s | Entry #3 | [View][Sign] │  │
│ └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```


## Notes for AI Copilot

- **MULTIPLE ENTRIES ALLOWED**: No restriction on date/shift combinations
- **NO UNIQUE CONSTRAINT** on date field in database
- Each form submission creates a NEW, INDEPENDENT record
- Form should RESET after successful submission
- Use `createdAt` timestamp to distinguish multiple entries on same day
- Display entries chronologically (newest first or oldest first)
- Consider grouping by date in UI for better readability
- Each entry has its own signature status and can be signed independently
- No duplicate checking needed - allow unlimited entries
- Show entry number or timestamp to distinguish multiple entries
- Make it clear to users that multiple entries are allowed
- Consider adding entry counter (Entry \#1, \#2, \#3, etc.) per day
- Use TypeScript strictly
- Follow Next.js 15 best practices

***

**This specification now supports unlimited multiple entries per day, with each submission creating an independent record that can be signed separately.**

