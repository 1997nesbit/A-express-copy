"use client"

import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ManagerDashboard } from "@/components/manager-dashboard"

export default function ManagerPage() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return null
  }

  // Check if user has manager access
  const hasManagerAccess = user?.role === "Administrator" || user?.role === "Manager"

  if (!hasManagerAccess) {
    return (
      <DashboardLayout>
        <div className="flex-1 p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access the manager dashboard.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <ManagerDashboard />
    </DashboardLayout>
  )
}
