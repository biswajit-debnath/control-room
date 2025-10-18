// Dashboard Layout - Uses shared AppLayout
// Accessible to everyone, but shows different UI based on auth status
import AppLayout from "@/components/app-layout"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppLayout requireAuth={false}>
      {children}
    </AppLayout>
  )
}
