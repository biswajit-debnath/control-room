# Public View Feature

## Overview
The Control Room application now includes a public view that allows anyone to browse all records and dashboards without authentication. This read-only view provides transparency while maintaining security for create and sign operations.

## Features

### Public Access Routes
- **`/public`** - Public dashboard showing all available modules
- **`/public/dg-operations`** - View all DG operations records
- **`/public/dg-operations/records/[date]`** - View detailed records for a specific date

### Restrictions
Public users **cannot**:
- ✗ Create new DG operation entries
- ✗ Sign records (requires EOD or AE role)
- ✗ Modify existing data
- ✗ Access user-specific features

### Features Available in Public View
Public users **can**:
- ✓ View all DG operations records
- ✓ Filter records by date and shift
- ✓ View detailed information for each entry
- ✓ See signature status of records
- ✓ Access the dashboard overview

## User Interface

### Header
The public view header includes:
- **Public View Badge** - Clearly indicates the current viewing mode
- **Login Button** (for non-authenticated users) - Quick access to login page
- **Go to Dashboard Button** (for authenticated users) - Navigate to full dashboard
- **Navigation Menu** - Access to public dashboard and DG operations

### Notice Banners
Throughout the public view, informational banners remind users:
- That they are in read-only mode
- How to login to access full features
- Which features require authentication

## Default Behavior

### Home Page (`/`)
- **Unauthenticated users** → Redirected to `/public`
- **Authenticated users** → Redirected to `/dashboard`

### Login Page (`/login`)
- Includes a "Back to Public View" button
- Allows users to return to browsing without logging in

## Navigation Flow

```
┌─────────────┐
│   / (home)  │
└──────┬──────┘
       │
       ├─── Authenticated? ───┐
       │                      │
      NO                     YES
       │                      │
       ▼                      ▼
┌─────────────┐        ┌────────────┐
│   /public   │        │ /dashboard │
└─────────────┘        └────────────┘
       │
       │
       ├─── Want to login? ──┐
       │                     │
      YES                   NO
       │                     │
       ▼                     │
┌─────────────┐             │
│   /login    │             │
└─────────────┘             │
       │                     │
       └─────── OR ──────────┘
                 │
                 ▼
        Continue browsing
           public view
```

## Technical Implementation

### Shared Layout Architecture
Instead of duplicating layout code, we use a single shared component:

**Core Component:**
- **`/components/app-layout.tsx`** - Single layout component that handles both views

**Layout Wrappers:**
1. **`/app/dashboard/layout.tsx`** - Wraps AppLayout with `requireAuth={true}, isPublicView={false}`
2. **`/app/public/layout.tsx`** - Wraps AppLayout with `requireAuth={false}, isPublicView={true}`

**Public Pages:**
3. **`/app/public/page.tsx`** - Public dashboard page
4. **`/app/public/dg-operations/page.tsx`** - Public records listing
5. **`/app/public/dg-operations/records/[date]/page.tsx`** - Public detailed view

### Benefits of Shared Layout
- ✅ Update navigation/header once, applies everywhere
- ✅ No code duplication
- ✅ Consistent UI across authenticated and public views
- ✅ Easy to maintain and extend

See `LAYOUT_REFACTORING.md` for detailed architecture documentation.

### Key Differences from Authenticated View
- No authentication requirement
- All create/edit buttons removed
- Sign buttons replaced with status badges
- Prominent "Public View" indicators
- Login prompts throughout the interface

## Use Cases

### Public Stakeholders
- Management viewing operational status
- External auditors reviewing records
- Contractors checking operational data
- Anyone needing transparency into operations

### Before Authentication
- New users exploring the system
- Users evaluating the platform
- Quick reference without login

## Security Considerations

### API Protection
- API endpoints still enforce authentication for write operations
- Read operations (GET requests) remain accessible
- No sensitive user data exposed in public views

### Data Visibility
All operational data is visible in public view:
- DG operation records
- Shift information
- Equipment readings
- Signatures and sign status

**Note:** Ensure that no confidential or sensitive information is stored in the DG operations records if you want to maintain strict privacy.

## Future Enhancements

Potential additions:
1. Public statistics/analytics dashboard
2. Export functionality for public data
3. Public announcement/notice board
4. Read-only access to other modules (G1 Mahabahu, G4 Pragjyotispur, CBS)

## Testing

### Manual Testing
1. Open browser in incognito/private mode
2. Navigate to `http://localhost:3000`
3. Should land on `/public` without authentication
4. Test all public routes:
   - `/public` - Dashboard
   - `/public/dg-operations` - Records list
   - Click on "View Details" - Should navigate to date-specific page
5. Click "Login" button - Should navigate to login page
6. From login, click "Back to Public View" - Should return to public view

### Authenticated User Testing
1. Login as a regular user
2. Navigate to `/public`
3. Header should show user info and "Go to Dashboard" button
4. User can still access public view while logged in

## Notes for Developers

- Public pages do **not** require authentication checks
- Session is still available in public pages (for optional features)
- Public layouts are separate from dashboard layouts
- All public routes use `/public` prefix for clarity
- Responsive design maintained across all public pages
