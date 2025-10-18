# Layout Refactoring - Single Shared Component

## Problem Solved
Previously, we had two separate layouts (`/app/dashboard/layout.tsx` and `/app/public/layout.tsx`) with 95% duplicated code. This created maintenance overhead - any UI change to navigation, header, or styling required updating both files.

## Solution: Shared AppLayout Component

Created a single, reusable `AppLayout` component that handles both authenticated and public views through props.

### File Structure

```
components/
  └── app-layout.tsx          ← Single source of truth for layout

app/
  ├── dashboard/
  │   └── layout.tsx          ← 10 lines (uses AppLayout)
  ├── public/
  │   └── layout.tsx          ← 10 lines (uses AppLayout)
  └── dg-operations/
      └── layout.tsx          ← Already using DashboardLayout
```

## Implementation

### Shared Component: `components/app-layout.tsx`

**Props:**
```typescript
interface AppLayoutProps {
  children: React.ReactNode
  requireAuth?: boolean    // If true, redirects to login when not authenticated
  isPublicView?: boolean   // If true, shows public view UI elements
}
```

**Features:**
- Single codebase for header, navigation, and layout
- Conditional rendering based on `isPublicView` prop
- Smart path handling: uses `/public` prefix for public routes
- Session-aware: shows login button or user info appropriately

### Dashboard Layout (Authenticated)
```tsx
// app/dashboard/layout.tsx
import AppLayout from "@/components/app-layout"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppLayout requireAuth={true} isPublicView={false}>
      {children}
    </AppLayout>
  )
}
```

### Public Layout (No Auth Required)
```tsx
// app/public/layout.tsx
import AppLayout from "@/components/app-layout"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppLayout requireAuth={false} isPublicView={true}>
      {children}
    </AppLayout>
  )
}
```

## Key Differences Between Views

The shared component handles these differences automatically:

| Feature | Authenticated View | Public View |
|---------|-------------------|-------------|
| **Header Badge** | None | "Public View" badge |
| **User Section** | User info + Logout button | Login button (if not logged in)<br>Go to Dashboard (if logged in) |
| **Navigation Base** | `/dashboard` | `/public` |
| **Auth Requirement** | Required (redirects to login) | Optional |

## Benefits

### ✅ Single Source of Truth
- Update navigation once, applies everywhere
- Consistent styling across authenticated and public views
- No duplicated code

### ✅ Easy Maintenance
- Add new navigation items in one place
- Update header styling once
- Bug fixes apply to both views automatically

### ✅ Type Safety
- Props clearly define behavior
- TypeScript ensures correct usage
- Less room for errors

### ✅ Better Code Organization
- Layout logic separated from business logic
- Reusable component pattern
- Easy to extend with new view types

## Future Extensibility

Adding a new view type is simple:

```tsx
// app/admin/layout.tsx
import AppLayout from "@/components/app-layout"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppLayout 
      requireAuth={true} 
      isPublicView={false}
      // Could add: isAdminView={true} for admin-specific UI
    >
      {children}
    </AppLayout>
  )
}
```

## Code Reduction

**Before:**
- `dashboard/layout.tsx`: ~180 lines
- `public/layout.tsx`: ~180 lines
- **Total: ~360 lines** of mostly duplicated code

**After:**
- `components/app-layout.tsx`: ~220 lines (shared logic)
- `dashboard/layout.tsx`: ~10 lines (wrapper)
- `public/layout.tsx`: ~10 lines (wrapper)
- **Total: ~240 lines** with no duplication

**Savings: ~120 lines + eliminated duplication**

## Migration Notes

No changes required to:
- Page components
- Existing routing
- API endpoints
- User-facing functionality

Everything works exactly the same, just with better maintainability!
